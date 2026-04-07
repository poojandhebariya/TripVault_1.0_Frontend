import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axios-instance";
import { useSnackbar } from "react-snackify";
import type {
  BucketListRequestDto,
  PlaceBucketListRequestDto,
  BucketList,
  BucketListStats,
} from "../../types/bucket-list";
import { bucketListKeys } from "./keys";
import { vaultKeys } from "../vault/keys";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Patch isBucketListed flag on every cached vault query that contains vaultId */
const optimisticallyUpdateVaults = (
  queryClient: any,
  vaultId: string,
  isBucketListed: boolean,
) => {
  queryClient.setQueriesData({ queryKey: vaultKeys.all() }, (old: any) => {
    if (!old) return old;
    if (old.id === vaultId) return { ...old, isBucketListed };
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: old.data.map((v: any) =>
          v.id === vaultId ? { ...v, isBucketListed } : v,
        ),
      };
    }
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data?.map((v: any) =>
            v.id === vaultId ? { ...v, isBucketListed } : v,
          ),
        })),
      };
    }
    if (Array.isArray(old)) {
      return old.map((v: any) =>
        v.id === vaultId ? { ...v, isBucketListed } : v,
      );
    }
    return old;
  });
};

/** Prepend a new item to every cached bucket-list page (skips duplicates) */
const optimisticallyPrependToBucketList = (
  queryClient: any,
  newItem: BucketList,
  dedupeKey: "vaultId" | "placeId",
) => {
  queryClient.setQueriesData({ queryKey: bucketListKeys.all() }, (old: any) => {
    if (!old) return old;

    if (old.data && Array.isArray(old.data)) {
      if (old.data.find((item: BucketList) => item[dedupeKey] && item[dedupeKey] === newItem[dedupeKey])) {
        return old;
      }
      return {
        ...old,
        data: [newItem, ...old.data],
        total: (old.total || 0) + 1,
      };
    }

    if (Array.isArray(old)) {
      if (old.find((item: BucketList) => item[dedupeKey] && item[dedupeKey] === newItem[dedupeKey])) {
        return old;
      }
      return [newItem, ...old];
    }

    return old;
  });
};

// ─── Vault bucket list ────────────────────────────────────────────────────────

export const useAddToBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationKey: bucketListKeys.add(""),
    mutationFn: async ({
      vaultId,
      data,
    }: {
      vaultId: string;
      data: BucketListRequestDto;
    }) => {
      const response = await axiosInstance.post(
        `/bucket-list/${vaultId}`,
        data,
      );
      return response.data;
    },
    onMutate: async ({ vaultId, data }) => {
      await queryClient.cancelQueries({ queryKey: bucketListKeys.all() });
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      const previousStats = queryClient.getQueryData<BucketListStats>(
        bucketListKeys.stats(),
      );
      const previousVaults = queryClient.getQueriesData({
        queryKey: vaultKeys.all(),
      });
      const previousBucketList = queryClient.getQueriesData({
        queryKey: bucketListKeys.all(),
      });

      // Optimistically update stats
      if (previousStats) {
        queryClient.setQueryData<BucketListStats>(bucketListKeys.stats(), {
          ...previousStats,
          totalPlaces: previousStats.totalPlaces + 1,
          highPriority:
            data.priority === "HIGH"
              ? previousStats.highPriority + 1
              : previousStats.highPriority,
          countries: previousStats.countries,
        });
      }

      // Optimistically update vault isBucketListed flag
      optimisticallyUpdateVaults(queryClient, vaultId, true);

      // Find vault data in cache to build optimistic bucket list item
      const vaultQueriesData = queryClient.getQueriesData<any>({
        queryKey: vaultKeys.all(),
      });

      let vault: any;
      for (const [, cache] of vaultQueriesData) {
        if (!cache) continue;
        if (cache.id === vaultId) { vault = cache; break; }
        if (cache.data && Array.isArray(cache.data)) {
          vault = cache.data.find((v: any) => v.id === vaultId);
          if (vault) break;
        }
        if (cache.pages) {
          for (const page of cache.pages) {
            if (page.data) {
              vault = page.data.find((v: any) => v.id === vaultId);
              if (vault) break;
            }
          }
          if (vault) break;
        }
      }

      if (vault) {
        const newItem: BucketList = {
          id: -Math.floor(Math.random() * 1_000_000),
          vaultId,
          vault,
          targetYear: data.targetYear,
          priority: data.priority,
          createdAt: new Date().toISOString(),
        };
        optimisticallyPrependToBucketList(queryClient, newItem, "vaultId");
      }

      return { previousStats, previousVaults, previousBucketList };
    },
    onSuccess: () => {
      showSnackbar({ message: "Added to bucket list!", variant: "success" });
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previousStats) {
        queryClient.setQueryData(bucketListKeys.stats(), context.previousStats);
      }
      if (context?.previousVaults) {
        for (const [queryKey, data] of context.previousVaults) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousBucketList) {
        for (const [queryKey, data] of context.previousBucketList) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      showSnackbar({
        message:
          error.response?.data?.message || "Failed to add to bucket list",
        variant: "error",
      });
    },
  });
};

// ─── Place bucket list ────────────────────────────────────────────────────────

export const useAddPlaceToBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationKey: [...bucketListKeys.all(), "add-place"],
    mutationFn: async (data: PlaceBucketListRequestDto) => {
      const response = await axiosInstance.post("/bucket-list/place", data);
      return response.data;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: bucketListKeys.all() });

      const previousStats = queryClient.getQueryData<BucketListStats>(
        bucketListKeys.stats(),
      );
      const previousBucketList = queryClient.getQueriesData({
        queryKey: bucketListKeys.all(),
      });

      // Optimistically bump stats
      if (previousStats) {
        queryClient.setQueryData<BucketListStats>(bucketListKeys.stats(), {
          ...previousStats,
          totalPlaces: previousStats.totalPlaces + 1,
          highPriority:
            data.priority === "HIGH"
              ? previousStats.highPriority + 1
              : previousStats.highPriority,
          countries: previousStats.countries,
        });
      }

      // Optimistically prepend the new place item to the bucket list
      const newItem: BucketList = {
        id: -Math.floor(Math.random() * 1_000_000), // temp negative id
        placeId: data.placeId,
        placeName: data.placeName,
        placeLocation: data.placeLocation,
        placeCountry: data.placeCountry,
        placeCountryCode: data.placeCountryCode,
        placeImage: data.placeImage,
        placeLat: data.placeLat,
        placeLng: data.placeLng,
        placeType: data.placeType,
        placeEmoji: data.placeEmoji,
        targetYear: data.targetYear,
        priority: data.priority,
        createdAt: new Date().toISOString(),
      };
      optimisticallyPrependToBucketList(queryClient, newItem, "placeId");

      return { previousStats, previousBucketList };
    },
    onSuccess: () => {
      showSnackbar({ message: "Place added to bucket list!", variant: "success" });
      // Invalidate to get the real server-assigned id
      queryClient.invalidateQueries({ queryKey: bucketListKeys.all() });
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previousStats) {
        queryClient.setQueryData(bucketListKeys.stats(), context.previousStats);
      }
      if (context?.previousBucketList) {
        for (const [queryKey, data] of context.previousBucketList) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      showSnackbar({
        message:
          error.response?.data?.message || "Failed to add to bucket list",
        variant: "error",
      });
    },
  });
};

// ─── Remove ───────────────────────────────────────────────────────────────────

export const useRemoveFromBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationKey: bucketListKeys.all(),
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/bucket-list/${id}`);
      return response.data;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: bucketListKeys.all() });
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      const previousLists = queryClient.getQueriesData<{
        data: BucketList[];
        page: number;
        totalPages: number;
        total: number;
      }>({ queryKey: bucketListKeys.all() });

      const previousStats = queryClient.getQueryData<BucketListStats>(
        bucketListKeys.stats(),
      );
      const previousVaults = queryClient.getQueriesData({
        queryKey: vaultKeys.all(),
      });

      let removedItem: BucketList | undefined;
      for (const [, data] of previousLists) {
        if (data?.data) {
          removedItem = data.data.find((item: BucketList) => item.id === id);
          if (removedItem) break;
        }
      }

      // Remove from all cached bucket-list pages
      queryClient.setQueriesData<{
        data: BucketList[];
        page: number;
        totalPages: number;
        total: number;
      }>({ queryKey: bucketListKeys.all() }, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((item: BucketList) => item.id !== id),
          total: Math.max(0, (old.total || 0) - 1),
        };
      });

      // If it was vault-based, flip the vault's isBucketListed flag
      if (removedItem?.vaultId) {
        optimisticallyUpdateVaults(queryClient, removedItem.vaultId, false);
      }

      // Update stats
      if (previousStats && removedItem) {
        queryClient.setQueryData<BucketListStats>(bucketListKeys.stats(), {
          ...previousStats,
          totalPlaces: Math.max(0, previousStats.totalPlaces - 1),
          highPriority:
            removedItem.priority === "HIGH"
              ? Math.max(0, previousStats.highPriority - 1)
              : previousStats.highPriority,
          countries: previousStats.countries,
        });
      }

      return { previousLists, previousStats, previousVaults };
    },
    onSuccess: () => {
      showSnackbar({ message: "Removed from bucket list", variant: "success" });
    },
    onError: (error: any, _id, context: any) => {
      if (context?.previousLists) {
        for (const [queryKey, data] of context.previousLists) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      if (context?.previousStats) {
        queryClient.setQueryData(bucketListKeys.stats(), context.previousStats);
      }
      if (context?.previousVaults) {
        for (const [queryKey, data] of context.previousVaults) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      showSnackbar({
        message:
          error.response?.data?.message || "Failed to remove from bucket list",
        variant: "error",
      });
    },
  });
};
