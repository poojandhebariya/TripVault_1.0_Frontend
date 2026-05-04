import { vaultKeys } from "./keys";
import { userKeys } from "../user/keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response";
import type { Vault, VaultComment } from "../../types/vault";
import type { User } from "../../types/user";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useSnackbar } from "react-snackify";

export const vaultMutation = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  /**
   * Optimistically adds a vault's location to the current user's
   * `countriesVisited` and `placesVisited` profile stats.
   */
  const updateProfileStats = (vault: Vault) => {
    if (!vault.location?.label) return;
    const country = vault.location.label.split(",").at(-1)?.trim() ?? "";
    const place = vault.location.label.split(",")[0]?.trim() ?? "";
    queryClient.setQueryData<User>(userKeys.getProfile(), (old) => {
      if (!old) return old;
      const newCountries =
        country && !old.countriesVisited?.includes(country)
          ? [...(old.countriesVisited ?? []), country]
          : old.countriesVisited;
      const newPlaces =
        place && !old.placesVisited?.includes(place)
          ? [...(old.placesVisited ?? []), place]
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

  // ─────────────────────────────────────────────────────────────────────────
  // Create Vault
  // ─────────────────────────────────────────────────────────────────────────

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
              id: previousProfile.id,
              username: previousProfile.username,
              name: previousProfile.name,
              profilePicUrl: previousProfile.profilePicUrl ?? null,
            }
          : undefined,
      };

      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old ? [optimisticVault, ...old] : [optimisticVault],
      );

      queryClient.setQueryData<User>(userKeys.getProfile(), (old) => {
        if (!old) return old;
        return {
          ...old,
          vaultsCount: (old.vaultsCount ?? 0) + 1,
        };
      });

      if (payload.visibility === "public" && payload.status === "publish") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            return { ...old, data: [optimisticVault, ...(old.data ?? [])] };
          },
        );
      }

      return { previousMyVaults, previousPublicVaults, previousProfile };
    },
    onError: (_err: unknown, _payload: Vault, context: any) => {
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
    onSuccess: (data: Vault, payload: Vault) => {
      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old
          ? old.map((v) => (v.id?.startsWith("optimistic-") ? data : v))
          : [data],
      );
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
        updateProfileStats(payload);
      }
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Toggle Pin
  // ─────────────────────────────────────────────────────────────────────────

  const togglePinMutation = {
    mutationKey: vaultKeys.togglePin(),
    mutationFn: async (vaultId: string): Promise<Vault> => {
      const response = await axiosInstance.patch<ApiResponse<Vault>>(
        `/vault/${vaultId}/pin`,
      );
      return response.data.data;
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.getMyVaults() });
      await queryClient.cancelQueries({ queryKey: userKeys.taggedVaults() });

      const previousVaults = queryClient.getQueryData<Vault[]>(
        vaultKeys.getMyVaults(),
      );
      const previousTaggedVaults = queryClient.getQueryData<Vault[]>(
        userKeys.taggedVaults(),
      );

      // Helper to update a list of vaults
      const updateList = (list: Vault[] | undefined, key: any) => {
        if (!list) return;
        queryClient.setQueryData<Vault[]>(key, (old) => {
          if (!old) return [];
          const pinnedCount = old.filter(
            (v) => v.isPinned && v.id !== vaultId,
          ).length;
          return old
            .map((v) => {
              if (v.id === vaultId) {
                const isPinning = !v.isPinned;
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
              if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
              if (a.isPinned && b.isPinned) {
                if (!a.pinnedAt) return 1;
                if (!b.pinnedAt) return -1;
                return (
                  new Date(b.pinnedAt).getTime() -
                  new Date(a.pinnedAt).getTime()
                );
              }
              if (!a.createdAt) return 1;
              if (!b.createdAt) return -1;
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });
        });
      };

      updateList(previousVaults, vaultKeys.getMyVaults());
      updateList(previousTaggedVaults, userKeys.taggedVaults());

      return { previousVaults, previousTaggedVaults };
    },
    onError: (_err: unknown, _newVault: string, context: any) => {
      if (context?.previousVaults) {
        queryClient.setQueryData(
          vaultKeys.getMyVaults(),
          context.previousVaults,
        );
      }
      if (context?.previousTaggedVaults) {
        queryClient.setQueryData(
          userKeys.taggedVaults(),
          context.previousTaggedVaults,
        );
      }
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Increment View
  // ─────────────────────────────────────────────────────────────────────────

  const incrementViewMutation = {
    mutationKey: vaultKeys.incrementView(),
    mutationFn: async (vaultId: string): Promise<Vault> => {
      const response = await axiosInstance.post<ApiResponse<Vault>>(
        `/vault/${vaultId}/view`,
      );
      return response.data.data;
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const previousQueries = _applyToAllVaultQueries(vaultId, (v) => ({
        ...v,
        impressionsCount: (v.impressionsCount ?? 0) + 1,
      }));
      return { previousQueries };
    },
    onError: (_err: unknown, _vars: unknown, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) =>
          queryClient.setQueryData(queryKey, data),
        );
      }
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete Vault
  // ─────────────────────────────────────────────────────────────────────────

  const deleteVaultMutation = {
    mutationKey: vaultKeys.deleteVault(),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.delete(`/vault/${vaultId}`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const queryCache = queryClient.getQueryCache();
      const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });
      const previousQueries = allVaultQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      allVaultQueries.forEach((query) => {
        const data = query.state.data;
        if (!data) return;
        if (Array.isArray(data)) {
          queryClient.setQueryData(query.queryKey, (old: any) =>
            Array.isArray(old) ? old.filter((v: any) => v.id !== vaultId) : old,
          );
        } else if (
          typeof data === "object" &&
          "data" in data &&
          Array.isArray((data as any).data)
        ) {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.filter((v: any) => v.id !== vaultId),
            };
          });
        }
      });

      return { previousQueries };
    },
    onError: (_err: unknown, _vaultId: string, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      showSnackbar({
        message: "Vault deleted successfully",
        variant: "success",
        classname: "text-white",
      });
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Delete All Vaults
  // ─────────────────────────────────────────────────────────────────────────

  const deleteAllVaultsMutation = {
    mutationKey: vaultKeys.deleteVault(), // reusing deleteVault key for invalidation
    mutationFn: async (): Promise<void> => {
      await axiosInstance.delete(`/vault/all`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const queryCache = queryClient.getQueryCache();
      const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });
      const previousQueries = allVaultQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      const previousProfile = queryClient.getQueryData<User>(userKeys.getProfile());

      // Empty all vault lists
      allVaultQueries.forEach((query) => {
        const data = query.state.data;
        if (!data) return;
        if (Array.isArray(data)) {
          queryClient.setQueryData(query.queryKey, []);
        } else if (
          typeof data === "object" &&
          "data" in data &&
          Array.isArray((data as any).data)
        ) {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return { ...old, data: [] };
          });
        }
      });

      // Update profile count and clear travel stats
      queryClient.setQueryData<User>(userKeys.getProfile(), (old) => {
        if (!old) return old;
        return { 
          ...old, 
          vaultsCount: 0,
          countriesVisited: [],
          placesVisited: []
        };
      });

      return { previousQueries, previousProfile };
    },
    onError: (_err: unknown, _vars: void, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.getProfile(), context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: vaultKeys.all() });
      queryClient.invalidateQueries({ queryKey: userKeys.getProfile() });
      showSnackbar({
        message: "All vaults deleted successfully",
        variant: "success",
        classname: "text-white",
      });
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Not Interested in Vault
  // ─────────────────────────────────────────────────────────────────────────

  const notInterestedMutation = {
    mutationKey: vaultKeys.all(),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.post(`/vault/${vaultId}/not-interested`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const queryCache = queryClient.getQueryCache();
      const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });
      const previousQueries = allVaultQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      // Remove the vault eagerly from all lists
      allVaultQueries.forEach((query) => {
        const data = query.state.data;
        if (!data) return;
        if (Array.isArray(data)) {
          queryClient.setQueryData(query.queryKey, (old: any) =>
            Array.isArray(old) ? old.filter((v: any) => v.id !== vaultId) : old,
          );
        } else if (
          typeof data === "object" &&
          "data" in data &&
          Array.isArray((data as any).data)
        ) {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.filter((v: any) => v.id !== vaultId),
            };
          });
        }
      });

      showSnackbar({
        message: "We'll show you fewer posts like this.",
        variant: "info",
        classname: "text-white",
      });

      return { previousQueries };
    },
    onError: (_err: unknown, _vaultId: string, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Report Vault
  // ─────────────────────────────────────────────────────────────────────────

  const reportVaultMutation = {
    mutationKey: vaultKeys.all(),
    mutationFn: async ({
      vaultId,
      reason,
      comment,
    }: {
      vaultId: string;
      reason: string;
      comment: string;
    }): Promise<void> => {
      await axiosInstance.post(`/vault/${vaultId}/report`, { reason, comment });
    },
    onMutate: async (_vars: { vaultId: string; reason: string; comment: string }) => {
      // No optimistic UI change needed for reports — just cancel in-flight vault queries
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
    },
    onError: () => {
      showSnackbar({
        message: "Failed to submit report. Please try again.",
        variant: "error",
        classname: "text-white",
      });
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Update Vault
  // ─────────────────────────────────────────────────────────────────────────

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
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const queryCache = queryClient.getQueryCache();
      const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });
      const previousQueries = allVaultQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data,
      }));

      allVaultQueries.forEach((query) => {
        const data = query.state.data;
        if (!data) return;
        if (Array.isArray(data)) {
          queryClient.setQueryData(query.queryKey, (old: any) =>
            Array.isArray(old)
              ? old.map((v: any) => (v.id === id ? { ...v, ...payload } : v))
              : old,
          );
        } else if (
          typeof data === "object" &&
          "data" in data &&
          Array.isArray((data as any).data)
        ) {
          queryClient.setQueryData(query.queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: old.data.map((v: any) =>
                v.id === id ? { ...v, ...payload } : v,
              ),
            };
          });
        } else if (typeof data === "object" && (data as any).id === id) {
          queryClient.setQueryData(query.queryKey, (old: any) => ({
            ...old,
            ...payload,
          }));
        }
      });

      return { previousQueries };
    },
    onError: (
      _err: unknown,
      _variables: { id: string; payload: Vault },
      context: any,
    ) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Publish Vault
  // ─────────────────────────────────────────────────────────────────────────

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
      const targetVault = previousMyVaults?.find((v) => v.id === id);

      queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) =>
        old
          ? old.map((v) =>
              v.id === id
                ? { ...v, status: "publish" as const, scheduledAt: null }
                : v,
            )
          : old,
      );

      if (targetVault && targetVault.visibility === "public") {
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          (old: any) => {
            if (!old) return old;
            const filtered = (old.data ?? []).filter((v: Vault) => v.id !== id);
            const promoted: Vault = {
              ...targetVault,
              status: "publish" as const,
              scheduledAt: null,
              author:
                targetVault.author ??
                (previousProfile
                  ? {
                      id: previousProfile.id,
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

      if (targetVault) updateProfileStats(targetVault);
      return { previousMyVaults, previousPublicVaults, previousProfile };
    },
    onError: (_err: unknown, _vars: void, context: any) => {
      if (context?.previousMyVaults !== undefined)
        queryClient.setQueryData(
          vaultKeys.getMyVaults(),
          context.previousMyVaults,
        );
      if (context?.previousPublicVaults !== undefined)
        queryClient.setQueryData(
          [...vaultKeys.getPublicVaults(), 1],
          context.previousPublicVaults,
        );
      if (context?.previousProfile !== undefined)
        queryClient.setQueryData(
          userKeys.getProfile(),
          context.previousProfile,
        );
    },
    onSuccess: (data: Vault) => {
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
        updateProfileStats(data);
      }
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Like / Unlike Vault
  // ─────────────────────────────────────────────────────────────────────────

  const _applyToAllVaultQueries = (
    vaultId: string,
    updater: (v: any) => any,
  ) => {
    const queryCache = queryClient.getQueryCache();
    const allVaultQueries = queryCache.findAll({ queryKey: vaultKeys.all() });
    const previousQueries = allVaultQueries.map((q) => ({
      queryKey: q.queryKey,
      data: q.state.data,
    }));

    allVaultQueries.forEach((query) => {
      const data = query.state.data;
      if (!data) return;
      if (Array.isArray(data)) {
        queryClient.setQueryData(query.queryKey, (old: any) =>
          Array.isArray(old)
            ? old.map((v: any) => (v.id === vaultId ? updater(v) : v))
            : old,
        );
      } else if (
        typeof data === "object" &&
        "data" in data &&
        Array.isArray((data as any).data)
      ) {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((v: any) => (v.id === vaultId ? updater(v) : v)),
          };
        });
      } else if (typeof data === "object" && (data as any).id === vaultId) {
        queryClient.setQueryData(query.queryKey, (old: any) => updater(old));
      }
    });

    return previousQueries;
  };

  const likeVaultMutation = {
    mutationKey: vaultKeys.all(),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.post(`/vault/${vaultId}/like`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const previousQueries = _applyToAllVaultQueries(vaultId, (v) => ({
        ...v,
        likesCount: (v.likesCount ?? 0) + 1,
        isLiked: true,
      }));
      return { previousQueries };
    },
    onError: (_err: unknown, _vars: unknown, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) =>
          queryClient.setQueryData(queryKey, data),
        );
      }
    },
  };

  const unlikeVaultMutation = {
    mutationKey: vaultKeys.all(),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.delete(`/vault/${vaultId}/like`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });
      const previousQueries = _applyToAllVaultQueries(vaultId, (v) => ({
        ...v,
        likesCount: Math.max((v.likesCount ?? 0) - 1, 0),
        isLiked: false,
      }));
      return { previousQueries };
    },
    onError: (_err: unknown, _vars: unknown, context: any) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) =>
          queryClient.setQueryData(queryKey, data),
        );
      }
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Comment mutations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Helper: bump commentsCount by `delta` in all vault list caches.
   */
  const _updateVaultCommentsCountInLists = (vaultId: string, delta: number) => {
    _applyToAllVaultQueries(vaultId, (v) => ({
      ...v,
      commentsCount: Math.max((v.commentsCount ?? 0) + delta, 0),
    }));
  };

  const postCommentMutation = (vaultId: string) => ({
    mutationKey: vaultKeys.postComment(vaultId),
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }): Promise<VaultComment> => {
      const response = await axiosInstance.post<ApiResponse<VaultComment>>(
        `/vault/${vaultId}/comments`,
        { text, parentId },
      );
      return response.data.data;
    },
    onMutate: async ({ text, parentId }: { text: string; parentId?: string }) => {
      await queryClient.cancelQueries({
        queryKey: vaultKeys.getComments(vaultId),
      });

      const previousComments = queryClient.getQueryData(
        vaultKeys.getComments(vaultId),
      );
      const currentUser = queryClient.getQueryData<User>(userKeys.getProfile());

      const optimisticComment: VaultComment = {
        id: `optimistic-${Date.now()}`,
        vaultId,
        text,
        parentId,
        author: {
          id: currentUser?.id ?? null,
          username: currentUser?.username ?? null,
          name: currentUser?.name ?? null,
          profilePicUrl: currentUser?.profilePicUrl ?? null,
        },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<PaginatedResponse<VaultComment>>>(
        vaultKeys.getComments(vaultId),
        (old) => {
          if (!old) {
            if (parentId) return old; // Don't safely init a top level array if it's a child.
            return {
              pages: [
                { data: [optimisticComment], page: 1, totalPages: 1, total: 1 },
              ],
              pageParams: [1],
            };
          }
          const newPages = [...old.pages];
          
          if (parentId) {
             // Find parent and add to its replies
             newPages.forEach(page => {
                 page.data = page.data.map(c => {
                     if (c.id === parentId) {
                         return { ...c, replies: [...(c.replies ?? []), optimisticComment] };
                     }
                     return c;
                 });
             });
          } else {
             // Prepend to top level
             newPages[0] = {
               ...newPages[0],
               data: [optimisticComment, ...newPages[0].data],
               total: newPages[0].total + 1,
             };
          }
          
          return { ...old, pages: newPages };
        },
      );

      // Increment commentsCount across all matching queries (lists and details)
      _updateVaultCommentsCountInLists(vaultId, 1);

      return { previousComments };
    },
    onError: (_err: unknown, _vars: { text: string; parentId?: string }, context: any) => {
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getComments(vaultId),
          context.previousComments,
        );
      }
      _updateVaultCommentsCountInLists(vaultId, -1);
    },
    onSuccess: (data: VaultComment, vars: { text: string; parentId?: string }) => {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<VaultComment>>>(
        vaultKeys.getComments(vaultId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((c) => {
                if (vars.parentId && c.id === vars.parentId) {
                   // Replace optimistic reply with real reply
                   return {
                       ...c,
                       replies: (c.replies ?? []).map(r => r.id.startsWith("optimistic-") ? data : r)
                   };
                }
                if (!vars.parentId && c.id.startsWith("optimistic-")) {
                   return data;
                }
                return c;
              }),
            })),
          };
        },
      );
    },
  });

  const deleteCommentMutation = (vaultId: string) => ({
    mutationKey: vaultKeys.deleteComment(vaultId),
    mutationFn: async (commentId: string): Promise<void> => {
      await axiosInstance.delete(`/vault/${vaultId}/comments/${commentId}`);
    },
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({
        queryKey: vaultKeys.getComments(vaultId),
      });

      const previousComments = queryClient.getQueryData(
        vaultKeys.getComments(vaultId),
      );

      queryClient.setQueryData<InfiniteData<PaginatedResponse<VaultComment>>>(
        vaultKeys.getComments(vaultId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((c) => c.id !== commentId).map(c => ({
                  ...c, 
                  replies: c.replies ? c.replies.filter(r => r.id !== commentId) : undefined
              })),
              total: Math.max(page.total - 1, 0),
            })),
          };
        },
      );

      // Decrement commentsCount across all matching queries (lists and details)
      _updateVaultCommentsCountInLists(vaultId, -1);

      return { previousComments };
    },
    onError: (_err: unknown, _commentId: string, context: any) => {
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getComments(vaultId),
          context.previousComments,
        );
      }
      _updateVaultCommentsCountInLists(vaultId, 1);
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Save / Unsave Vault
  // ─────────────────────────────────────────────────────────────────────────

  const saveVaultMutation = {
    mutationKey: vaultKeys.saveVault(""),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.post(`/vault/${vaultId}/save`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.getSavedVaults() });
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      const previousSaved = queryClient.getQueryData<Vault[]>(
        vaultKeys.getSavedVaults(),
      );

      const previousQueries = _applyToAllVaultQueries(vaultId, (v) => ({
        ...v,
        isSaved: true,
      }));

      const queryCache = queryClient.getQueryCache();
      let targetVault: Vault | undefined;
      for (const q of queryCache.findAll({ queryKey: vaultKeys.all() })) {
        const data = q.state.data as any;
        if (Array.isArray(data)) {
          targetVault = data.find((v: Vault) => v.id === vaultId);
        } else if (data?.data && Array.isArray(data.data)) {
          targetVault = data.data.find((v: Vault) => v.id === vaultId);
        } else if (data?.id === vaultId) {
          targetVault = data;
        }
        if (targetVault) break;
      }

      if (targetVault) {
        queryClient.setQueryData<Vault[]>(vaultKeys.getSavedVaults(), (old) => {
          if (!old) return [{ ...targetVault!, isSaved: true }];
          if (old.some((v) => v.id === vaultId)) return old;
          return [{ ...targetVault!, isSaved: true }, ...old];
        });
      }

      return { previousSaved, previousQueries };
    },
    onError: (_err: unknown, _vaultId: string, context: any) => {
      if (context?.previousSaved !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getSavedVaults(),
          context.previousSaved,
        );
      }
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) =>
          queryClient.setQueryData(queryKey, data),
        );
      }
    },
    onSuccess: (_: any, vaultId: string) => {
      // Find the vault in the cache to get its title
      const queryCache = queryClient.getQueryCache();
      let vaultTitle = "Vault";
      for (const q of queryCache.findAll({ queryKey: vaultKeys.all() })) {
        const data = q.state.data as any;
        let v: any;
        if (Array.isArray(data)) v = data.find((x: any) => x.id === vaultId);
        else if (data?.data && Array.isArray(data.data))
          v = data.data.find((x: any) => x.id === vaultId);
        else if (data?.id === vaultId) v = data;

        if (v?.title) {
          vaultTitle = v.title;
          break;
        }
      }

      const truncatedTitle =
        vaultTitle.length > 20 ? `${vaultTitle.slice(0, 20)}...` : vaultTitle;
      showSnackbar({
        message: `"${truncatedTitle}" saved!`,
        variant: "success",
        classname: "text-white",
      });
    },
  };

  const unsaveVaultMutation = {
    mutationKey: vaultKeys.unsaveVault(""),
    mutationFn: async (vaultId: string): Promise<void> => {
      await axiosInstance.delete(`/vault/${vaultId}/save`);
    },
    onMutate: async (vaultId: string) => {
      await queryClient.cancelQueries({ queryKey: vaultKeys.getSavedVaults() });
      await queryClient.cancelQueries({ queryKey: vaultKeys.all() });

      const previousSaved = queryClient.getQueryData<Vault[]>(
        vaultKeys.getSavedVaults(),
      );

      const previousQueries = _applyToAllVaultQueries(vaultId, (v) => ({
        ...v,
        isSaved: false,
      }));

      queryClient.setQueryData<Vault[]>(vaultKeys.getSavedVaults(), (old) =>
        old ? old.filter((v) => v.id !== vaultId) : [],
      );

      return { previousSaved, previousQueries };
    },
    onError: (_err: unknown, _vaultId: string, context: any) => {
      if (context?.previousSaved !== undefined) {
        queryClient.setQueryData(
          vaultKeys.getSavedVaults(),
          context.previousSaved,
        );
      }
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ queryKey, data }: any) =>
          queryClient.setQueryData(queryKey, data),
        );
      }
    },
    onSuccess: (_: any, vaultId: string) => {
      // Look up title from context or cache
      const queryCache = queryClient.getQueryCache();
      let vaultTitle = "Vault";
      for (const q of queryCache.findAll({ queryKey: vaultKeys.all() })) {
        const data = q.state.data as any;
        let v: any;
        if (Array.isArray(data)) v = data.find((x: any) => x.id === vaultId);
        else if (data?.data && Array.isArray(data.data))
          v = data.data.find((x: any) => x.id === vaultId);
        else if (data?.id === vaultId) v = data;

        if (v?.title) {
          vaultTitle = v.title;
          break;
        }
      }

      const truncatedTitle =
        vaultTitle.length > 20 ? `${vaultTitle.slice(0, 20)}...` : vaultTitle;

      showSnackbar({
        message: `"${truncatedTitle}" removed from saved.`,
        variant: "info",
        classname: "text-white",
        action: {
          label: "Undo",
          onClick: () => {
            // We use the same mutation hook to re-save
            // Note: Since this is inside a hook, we can't easily call other mutations
            // but we can just use the queryClient or axis directly if needed,
            // but the cleanest way is a simple post.
            axiosInstance.post(`/vault/${vaultId}/save`).then(() => {
              // Manually invalidate or trigger the save mutation logic
              // Actually, since we want optimistic behavior for Undo too:
              queryClient.invalidateQueries({
                queryKey: vaultKeys.getSavedVaults(),
              });
              queryClient.invalidateQueries({ queryKey: vaultKeys.all() });
            });
          },
        },
        duration: 5000,
      });
    },
  };


  return {
    createVaultMutation,
    togglePinMutation,
    incrementViewMutation,
    deleteVaultMutation,
    updateVaultMutation,
    publishVaultMutation,
    likeVaultMutation,
    unlikeVaultMutation,
    deleteAllVaultsMutation,
    postCommentMutation,
    deleteCommentMutation,
    saveVaultMutation,
    unsaveVaultMutation,
    notInterestedMutation,
    reportVaultMutation,
  };
};
