import { vaultKeys } from "./keys";
import { userKeys } from "../user/keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";
import type { Vault } from "../../types/vault";
import type { User } from "../../types/user";
import { useQueryClient } from "@tanstack/react-query";

export const vaultMutation = () => {
  const queryClient = useQueryClient();

  /**
   * Optimistically adds a vault's location to the current user's
   * `countriesVisited` and `placesVisited` profile stats.
   * Deduplicates so repeated publishes of the same location don't inflate counts.
   */
  const updateProfileStats = (vault: Vault) => {
    if (!vault.location?.label) return;

    const country = vault.location.label.split(",").at(-1)?.trim() ?? "";
    const place = vault.location.label.split(",")[0]?.trim() ?? "";

    queryClient.setQueryData<User>(userKeys.getProfile(), (old) => {
      if (!old) return old;
      const newCountries =
        country && !old.countriesVisited.includes(country)
          ? [...old.countriesVisited, country]
          : old.countriesVisited;
      const newPlaces =
        place && !old.placesVisited.includes(place)
          ? [...old.placesVisited, place]
          : old.placesVisited;
      if (
        newCountries === old.countriesVisited &&
        newPlaces === old.placesVisited
      )
        return old;
      return {
        ...old,
        countriesVisited: newCountries,
        placesVisited: newPlaces,
      };
    });
  };

  const createVaultMutation = {
    mutationKey: vaultKeys.create(),
    mutationFn: async (payload: Vault): Promise<Vault> => {
      const response = await axiosInstance.post<ApiResponse<Vault>>(
        "/vault/create",
        payload,
      );
      return response.data.data;
    },
    onMutate: async (payload: Vault) => {
      // Cancel any in-flight refetches to avoid overwriting our optimistic data
      await queryClient.cancelQueries({ queryKey: vaultKeys.getMyVaults() });
      await queryClient.cancelQueries({
        queryKey: vaultKeys.getPublicVaults(),
      });

      // --- Snapshot previous data for rollback ---
      const previousMyVaults = queryClient.getQueryData<Vault[]>(
        vaultKeys.getMyVaults(),
      );
      const previousPublicVaults = queryClient.getQueryData([
        ...vaultKeys.getPublicVaults(),
        1,
      ]);
      const previousProfile = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );

      // Build an optimistic vault object (no real id yet)
      const optimisticVault: Vault = {
        ...payload,
        id: `optimistic-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        impressionsCount: 0,
        isPinned: false,
        author: previousProfile
          ? {
              username: previousProfile.username,
              name: previousProfile.name,
              profilePicUrl: previousProfile.profilePicUrl ?? null,
            }
          : undefined,
      };

      // 1. Profile: prepend to getMyVaults array
      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old ? [optimisticVault, ...old] : [optimisticVault],
      );

      // 2. Home feed: prepend to public vaults (page 1) only if public + published
      if (payload.visibility === "public" && payload.status === "publish") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: [optimisticVault, ...(old.data ?? [])],
            };
          },
        );
      }

      return { previousMyVaults, previousPublicVaults };
    },
    onError: (_err: unknown, _payload: Vault, context: any) => {
      // Roll back profile vaults
      if (context?.previousMyVaults !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getMyVaults(),
          context.previousMyVaults,
        );
      }
      // Roll back public feed
      if (context?.previousPublicVaults !== undefined) {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          context.previousPublicVaults,
        );
      }
    },
    onSuccess: (data: Vault, payload: Vault) => {
      // Replace the optimistic entry with the real server data in getMyVaults
      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old
          ? old.map((v) => (v.id?.startsWith("optimistic-") ? data : v))
          : [data],
      );

      // Replace the optimistic entry with the real data in page-1 public feed
      if (payload.visibility === "public" && payload.status === "publish") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: (old.data ?? []).map((v: Vault) =>
                v.id?.startsWith("optimistic-") ? data : v,
              ),
            };
          },
        );
        // Update profile countries/places stats
        updateProfileStats(payload);
      }
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

  const updateVaultMutation = (id?: string) => ({
    mutationKey: id ? vaultKeys.getVaultDetails(id) : vaultKeys.all(),
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
    onMutate: async ({ id, payload }: { id: string; payload: Vault }) => {
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
            Array.isArray(old)
              ? old.map((v: any) => (v.id === id ? { ...v, ...payload } : v))
              : old,
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
              data: old.data.map((v: any) =>
                v.id === id ? { ...v, ...payload } : v,
              ),
            };
          });
        }
        // Case 3: Single detail object
        else if (typeof data === "object" && (data as any).id === id) {
          queryClient.setQueryData(queryKey, (old: any) => {
            return { ...old, ...payload };
          });
        }
      });

      return { previousQueries };
    },
    onError: (
      _err: unknown,
      _variables: { id: string; payload: Vault },
      context: any,
    ) => {
      // Roll back all queries to their previous snapshots
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  const publishVaultMutation = (id: string) => ({
    mutationKey: vaultKeys.publishVault(id),
    mutationFn: async (): Promise<Vault> => {
      const response = await axiosInstance.patch<ApiResponse<Vault>>(
        `/vault/${id}/publish`,
      );
      return response.data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.getMyVaults() });
      await queryClient.cancelQueries({
        queryKey: vaultKeys.getPublicVaults(),
      });

      const previousMyVaults = queryClient.getQueryData<Vault[]>(
        vaultKeys.getMyVaults(),
      );
      const previousPublicVaults = queryClient.getQueryData([
        ...vaultKeys.getPublicVaults(),
        1,
      ]);
      const previousProfile = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );

      // Find the vault in cache so we have its full data for the optimistic state
      const targetVault = previousMyVaults?.find((v) => v.id === id);

      // 1. Update status in getMyVaults
      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old
          ? old.map((v) =>
              v.id === id
                ? { ...v, status: "publish" as const, scheduledAt: null }
                : v,
            )
          : old,
      );

      // 2. Push to page-1 home feed if vault is public
      if (targetVault && targetVault.visibility === "public") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            // Remove any existing entry first (avoid duplicates)
            const filtered = (old.data ?? []).filter((v: Vault) => v.id !== id);
            const promoted: Vault = {
              ...targetVault,
              status: "publish" as const,
              scheduledAt: null,
              author:
                targetVault.author ??
                (previousProfile
                  ? {
                      username: previousProfile.username,
                      name: previousProfile.name,
                      profilePicUrl: previousProfile.profilePicUrl ?? null,
                    }
                  : undefined),
            };
            return { ...old, data: [promoted, ...filtered] };
          },
        );
      }

      // 3. Update profile stats optimistically
      if (targetVault) updateProfileStats(targetVault);

      return { previousMyVaults, previousPublicVaults, previousProfile };
    },
    onError: (_err: unknown, _vars: void, context: any) => {
      if (context?.previousMyVaults !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getMyVaults(),
          context.previousMyVaults,
        );
      }
      if (context?.previousPublicVaults !== undefined) {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          context.previousPublicVaults,
        );
      }
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(
          userKeys.getProfile(),
          context.previousProfile,
        );
      }
    },
    onSuccess: (data: Vault) => {
      // Replace optimistic entry with real server data
      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old ? old.map((v) => (v.id === id ? data : v)) : old,
      );
      if (data.visibility === "public") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: (old.data ?? []).map((v: Vault) =>
                v.id === id ? data : v,
              ),
            };
          },
        );
        // Ensure profile stats reflect the real server data
        updateProfileStats(data);
      }
    },
  });

  return {
    createVaultMutation,
    togglePinMutation,
    incrementViewMutation,
    deleteVaultMutation,
    updateVaultMutation,
    publishVaultMutation,
  };
};
