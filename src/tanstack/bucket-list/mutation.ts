import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axios-instance";
import { useSnackbar } from "react-snackify";
import type {
  BucketListRequestDto,
  BucketListDto,
  BucketListStats,
} from "../../types/bucket-list";
import { bucketListKeys } from "./keys";

// Helper to update any vault's isBucketListed flag deeply within the react-query cache
const optimisticallyUpdateVaults = (
  queryClient: any,
  vaultId: string,
  isBucketListed: boolean,
) => {
  queryClient.setQueriesData({ queryKey: ["vault"] }, (old: any) => {
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

export const useAddToBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
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
      await queryClient.cancelQueries({ queryKey: bucketListKeys.stats() });
      await queryClient.cancelQueries({ queryKey: ["vault"] });

      const previousStats = queryClient.getQueryData<BucketListStats>(
        bucketListKeys.stats(),
      );
      const previousVaults = queryClient.getQueriesData({
        queryKey: ["vault"],
      });

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

      optimisticallyUpdateVaults(queryClient, vaultId, true);

      return { previousStats, previousVaults };
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
      showSnackbar({
        message:
          error.response?.data?.message || "Failed to add to bucket list",
        variant: "error",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] });
      queryClient.invalidateQueries({ queryKey: bucketListKeys.stats() });
    },
  });
};

export const useRemoveFromBucketList = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/bucket-list/${id}`);
      return response.data;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["bucket-list"] });
      await queryClient.cancelQueries({ queryKey: bucketListKeys.stats() });
      await queryClient.cancelQueries({ queryKey: ["vault"] });

      const previousLists = queryClient.getQueriesData<{
        data: BucketListDto[];
        page: number;
        totalPages: number;
        total: number;
      }>({ queryKey: ["bucket-list"] });

      const previousStats = queryClient.getQueryData<BucketListStats>(
        bucketListKeys.stats(),
      );
      const previousVaults = queryClient.getQueriesData({
        queryKey: ["vault"],
      });

      let removedItem: BucketListDto | undefined;
      for (const [, data] of previousLists) {
        if (data?.data) {
          removedItem = data.data.find((item: BucketListDto) => item.id === id);
          if (removedItem) break;
        }
      }

      // Optimistically remove from all cached bucket-list pages
      queryClient.setQueriesData<{
        data: BucketListDto[];
        page: number;
        totalPages: number;
        total: number;
      }>({ queryKey: ["bucket-list"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((item: BucketListDto) => item.id !== id),
          total: Math.max(0, old.total - 1),
        };
      });

      // Optimistically update home feed vaults
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
