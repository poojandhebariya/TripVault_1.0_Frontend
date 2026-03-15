import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axios-instance";
import { useSnackbar } from "react-snackify";
import type {
  BucketListRequestDto,
  BucketList,
  BucketListStats,
} from "../../types/bucket-list";
import { bucketListKeys } from "./keys";
import { vaultKeys } from "../vault/keys";

// Helper to update any vault's isBucketListed flag deeply within the react-query cache
const optimisticallyUpdateVaults = (
  queryClient: any,
  vaultId: string,
  isBucketListed: boolean,
) => {
  queryClient.setQueriesData({ queryKey: vaultKeys.all() }, (old: any) => {
    if (!old) return old;
    // Single Vault detail
    if (old.id === vaultId) return { ...old, isBucketListed };

    // PagedResponse array of vaults
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: old.data.map((v: any) =>
          v.id === vaultId ? { ...v, isBucketListed } : v,
        ),
      };
    }

    // Infinite queries or nested pages
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

    // Direct flat array
    if (Array.isArray(old)) {
      return old.map((v: any) =>
        v.id === vaultId ? { ...v, isBucketListed } : v,
      );
    }

    return old;
  });
};

const optimisticallyUpdateBucketList = (
  queryClient: any,
  newItem: BucketList,
) => {
  queryClient.setQueriesData({ queryKey: bucketListKeys.all() }, (old: any) => {
    if (!old) return old;

    // PagedResponse
    if (old.data && Array.isArray(old.data)) {
      // Avoid duplicate if it somehow exists
      if (old.data.find((item: BucketList) => item.vaultId === newItem.vaultId)) {
        return old;
      }
      return {
        ...old,
        data: [newItem, ...old.data],
        total: (old.total || 0) + 1,
      };
    }

    if (Array.isArray(old)) {
      if (old.find((item: BucketList) => item.vaultId === newItem.vaultId)) {
        return old;
      }
      return [newItem, ...old];
    }

    return old;
  });
};

export const useAddToBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationKey: bucketListKeys.add(""), // Placeholder since we need vaultId from variables, but React Query usually takes variables in mutationFn. Actually for mutationKey it's better to use a static one unless it varies.
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
      // Cancel relevant queries
      await queryClient.cancelQueries({ queryKey: bucketListKeys.all() });
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      // Snapshot previous state
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

      // Optimistically update vaults
      optimisticallyUpdateVaults(queryClient, vaultId, true);

      // Find vault data to construct optimistic BucketList item
      const vaultQueriesData = queryClient.getQueriesData<any>({
        queryKey: vaultKeys.all(),
      });

      let vault: any;
      for (const [, cache] of vaultQueriesData) {
        if (!cache) continue;
        if (cache.id === vaultId) {
          vault = cache;
          break;
        }
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
          id: -Math.floor(Math.random() * 1000000), // Temp negative ID
          vaultId,
          vault,
          targetYear: data.targetYear,
          priority: data.priority,
          createdAt: new Date().toISOString(),
        };
        optimisticallyUpdateBucketList(queryClient, newItem);
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

export const useRemoveFromBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationKey: bucketListKeys.all(), // Use a base key or specific if possible
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

      // Optimistically remove from all cached bucket-list pages
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

      // Optimistically update vaults flags
      if (removedItem?.vaultId) {
        optimisticallyUpdateVaults(queryClient, removedItem.vaultId, false);
      }

      // Optimistically update stats
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

