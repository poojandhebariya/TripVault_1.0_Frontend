import { vaultKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../pages/types/api-response";
import type { Vault } from "../../pages/types/vault";
import { useQueryClient } from "@tanstack/react-query";

export const vaultMutation = () => {
  const queryClient = useQueryClient();

  const createVaultMutation = {
    mutationKey: vaultKeys.create(),
    mutationFn: async (payload: Vault): Promise<Vault> => {
      const response = await axiosInstance.post<ApiResponse<Vault>>(
        "/vault/create",
        payload,
      );
      return response.data.data;
    },
  };

  const togglePinMutation = {
    mutationKey: vaultKeys.togglePin(),
    mutationFn: async (vaultId: string): Promise<Vault> => {
      const response = await axiosInstance.patch<ApiResponse<Vault>>(
        `/vault/${vaultId}/pin`,
      );
      return response.data.data;
    },
    onMutate: async (vaultId: string) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: vaultKeys.getMyVaults() });

      // Snapshot the previous value
      const previousVaults = queryClient.getQueryData<Vault[]>(
        vaultKeys.getMyVaults(),
      );

      // Optimistically update to the new value
      if (previousVaults) {
        queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) => {
          if (!old) return [];
          const pinnedCount = old.filter(
            (v) => v.isPinned && v.id !== vaultId,
          ).length;

          return old
            .map((v) => {
              if (v.id === vaultId) {
                const isPinning = !v.isPinned;
                // If pinning and already at 3, don't optimistically update (will throw error anyway)
                if (isPinning && pinnedCount >= 3) return v;
                return {
                  ...v,
                  isPinned: isPinning,
                  pinnedAt: isPinning ? new Date().toISOString() : null,
                };
              }
              return v;
            })
            .sort((a, b) => {
              // Pinned vs Unpinned
              if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
              // Both Pinned: sort by pinnedAt DESC
              if (a.isPinned && b.isPinned) {
                if (!a.pinnedAt) return 1;
                if (!b.pinnedAt) return -1;
                return (
                  new Date(b.pinnedAt).getTime() -
                  new Date(a.pinnedAt).getTime()
                );
              }
              // Both Unpinned: sort by createdAt DESC
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });
        });
      }

      // Return a context object with the snapshotted value
      return { previousVaults };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err: unknown, _newVault: string, context: any) => {
      if (context?.previousVaults && queryClient) {
        queryClient.setQueryData(
          vaultKeys.getMyVaults(),
          context.previousVaults,
        );
      }
    },
  };

  const incrementViewMutation = {
    mutationKey: vaultKeys.incrementView(),
    mutationFn: async (vaultId: string): Promise<Vault> => {
      const response = await axiosInstance.post<ApiResponse<Vault>>(
        `/vault/${vaultId}/view`,
      );
      return response.data.data;
    },
  };

  const deleteVaultMutation = {
    mutationKey: vaultKeys.deleteVault(),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.delete(`/vault/${vaultId}`);
    },
    onMutate: async (vaultId: string) => {
      // Cancel any in-flight refetches
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      // Snapshot current data for all vault queries
      const queryCache = queryClient.getQueryCache();
      const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });

      const previousQueries = allVaultQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      // Optimistically update each query
      allVaultQueries.forEach((query) => {
        const queryKey = query.queryKey;
        const data = query.state.data;

        if (!data) return;

        // Case 1: Simple array (like getMyVaults)
        if (Array.isArray(data)) {
          queryClient.setQueryData(queryKey, (old: any) =>
            Array.isArray(old) ? old.filter((v: any) => v.id !== vaultId) : old,
          );
        }
        // Case 2: PaginatedResponse (like getPublicVaults, getNearbyVaults)
        else if (
          typeof data === "object" &&
          "data" in data &&
          Array.isArray((data as any).data)
        ) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.filter((v: any) => v.id !== vaultId),
              // We could decrement totalElements but it might be safer to leave it
              // as count is usually what matters for pagination UI
            };
          });
        }
      });

      return { previousQueries };
    },
    onError: (_err: unknown, _vaultId: string, context: any) => {
      // Roll back all queries to their previous snapshots
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  };

  const updateVaultMutation = {
    mutationKey: vaultKeys.all(), // Generic or more specific if you prefer
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Vault;
    }): Promise<Vault> => {
      const response = await axiosInstance.put<ApiResponse<Vault>>(
        `/vault/${id}`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: (_data: any, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.all() });
      queryClient.invalidateQueries({
        queryKey: vaultKeys.getVaultDetails(id),
      });
    },
  };

  return {
    createVaultMutation,
    togglePinMutation,
    incrementViewMutation,
    deleteVaultMutation,
    updateVaultMutation,
  };
};
