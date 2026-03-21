import { userKeys } from "./keys";
import { set } from "idb-keyval";
import type { User, PublicProfile } from "../../types/user";
import type { VaultTagNotification } from "../../types/notifications";
import type { Vault } from "../../types/vault";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";
import { useQueryClient } from "@tanstack/react-query";

export const userMutation = () => {
  const queryClient = useQueryClient();
  const profileMutation = {
    mutationKey: userKeys.createProfile(),
    mutationFn: async (data: Partial<User>) => {
      const response = await axiosInstance.post<ApiResponse<User>>(
        "/user/profile",
        data,
      );
      return response.data;
    },
    onMutate: async (newData: Partial<User>) => {
      await queryClient.cancelQueries({ queryKey: userKeys.getProfile() });
      const previousUser = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );
      queryClient.setQueryData(userKeys.getProfile(), (old: any) => ({
        ...old,
        ...newData,
      }));
      return { previousUser };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousUser?: User } | undefined,
    ) => {
      queryClient.setQueryData(userKeys.getProfile(), context?.previousUser);
    },
    onSuccess: async (data: ApiResponse<User>) => {
      await set("user", data.data);
      await queryClient.setQueryData(userKeys.getProfile(), data.data);
    },
  };

  const updateProfileMutation = {
    mutationKey: userKeys.updateProfile(),
    mutationFn: async (data: Partial<User>) => {
      const response = await axiosInstance.put<ApiResponse<User>>(
        "/user/profile",
        data,
      );
      return response.data;
    },
    onMutate: async (newData: Partial<User>) => {
      await queryClient.cancelQueries({ queryKey: userKeys.getProfile() });
      const previousUser = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );
      if (previousUser) {
        queryClient.setQueryData(userKeys.getProfile(), {
          ...previousUser,
          ...newData,
        });
      }
      return { previousUser };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousUser?: User } | undefined,
    ) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.getProfile(), context.previousUser);
      }
    },
    onSuccess: async (data: ApiResponse<User>) => {
      await set("user", data.data);
      await queryClient.setQueryData(userKeys.getProfile(), data.data);
    },
  };

  const followMutation = (id: string) => ({
    mutationKey: userKeys.follow(id),
    mutationFn: async (userId: string) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        `/user/follow/${userId}`,
      );
      return response.data;
    },
    onMutate: async () => {
      // Cancel related queries to prevent background refreshes from overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: userKeys.all() });
      await queryClient.cancelQueries({ queryKey: ["vault"] });

      // Snapshot the previous values
      const previousPublicProfile = queryClient.getQueryData<PublicProfile>(
        userKeys.getPublicProfile(id),
      );
      const previousOwnProfile = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );

      // Optimistically update public profile status
      if (previousPublicProfile) {
        queryClient.setQueryData<PublicProfile>(userKeys.getPublicProfile(id), {
          ...previousPublicProfile,
          isFollowing: true,
          followersCount: (previousPublicProfile.followersCount || 0) + 1,
        });
      }

      // Optimistically update own following count
      if (previousOwnProfile) {
        queryClient.setQueryData<User>(userKeys.getProfile(), {
          ...previousOwnProfile,
          followingCount: (previousOwnProfile.followingCount || 0) + 1,
        });
      }

      // Optimistically update author status in ALL vault lists
      queryClient.setQueriesData({ queryKey: ["vault"] }, (old: any) => {
        if (!old) return old;

        const updateAuthor = (v: any) =>
          v.author?.id === id
            ? { ...v, author: { ...v.author, isFollowing: true } }
            : v;

        if (old.author?.id) return updateAuthor(old);
        if (Array.isArray(old)) return old.map(updateAuthor);
        if (old.data) {
          if (Array.isArray(old.data)) {
            return { ...old, data: old.data.map(updateAuthor) };
          }
          if (old.data.data && Array.isArray(old.data.data)) {
            return {
              ...old,
              data: { ...old.data, data: old.data.data.map(updateAuthor) },
            };
          }
        }
        return old;
      });

      // Update following status in ALL user lists (followers, following, suggested, etc.)
      queryClient.setQueriesData({ queryKey: userKeys.all() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) =>
          p.id === id
            ? {
                ...p,
                isFollowing: true,
                followersCount: (p.followersCount || 0) + 1,
              }
            : p,
        );
      });

      // SPECIAL: Inject the newly followed user into the current user's following list
      // so that navigating to the "Following" tab shows them immediately.
      if (previousOwnProfile?.id) {
        // Find the profile data from any available cache source
        const followedProfile: PublicProfile | undefined =
          previousPublicProfile ??
          // Try searching suggested profiles cache for the user
          (
            queryClient.getQueryData<PublicProfile[]>(
              userKeys.getSuggestedProfiles(),
            ) ?? []
          ).find((p: PublicProfile) => p.id === id);

        if (followedProfile) {
          queryClient.setQueryData(
            userKeys.getFollowing(previousOwnProfile.id),
            (old: any) => {
              const list: PublicProfile[] = Array.isArray(old) ? old : [];
              // Avoid duplicates
              if (list.some((p) => p.id === id)) return list;
              return [{ ...followedProfile, isFollowing: true }, ...list];
            },
          );
        }
      }

      return { previousPublicProfile, previousOwnProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context:
        | { previousPublicProfile?: PublicProfile; previousOwnProfile?: User }
        | undefined,
    ) => {
      if (context?.previousPublicProfile) {
        queryClient.setQueryData(
          userKeys.getPublicProfile(id),
          context.previousPublicProfile,
        );
      }
      if (context?.previousOwnProfile) {
        queryClient.setQueryData(
          userKeys.getProfile(),
          context.previousOwnProfile,
        );
      }
    },
  });

  const unfollowMutation = (id: string) => ({
    mutationKey: userKeys.unfollow(id),
    mutationFn: async (userId: string) => {
      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/user/follow/${userId}`,
      );
      return response.data;
    },
    onMutate: async () => {
      // Cancel related queries to prevent background refreshes from overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: userKeys.all() });
      await queryClient.cancelQueries({ queryKey: ["vault"] });

      // Snapshot the previous values
      const previousPublicProfile = queryClient.getQueryData<PublicProfile>(
        userKeys.getPublicProfile(id),
      );
      const previousOwnProfile = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );

      // Optimistically update public profile status
      if (previousPublicProfile) {
        queryClient.setQueryData<PublicProfile>(userKeys.getPublicProfile(id), {
          ...previousPublicProfile,
          isFollowing: false,
          followersCount: Math.max(
            0,
            (previousPublicProfile.followersCount || 0) - 1,
          ),
        });
      }

      // Optimistically update own following count
      if (previousOwnProfile) {
        queryClient.setQueryData<User>(userKeys.getProfile(), {
          ...previousOwnProfile,
          followingCount: Math.max(
            0,
            (previousOwnProfile.followingCount || 0) - 1,
          ),
        });
      }

      // Optimistically update author status in ALL vault lists
      queryClient.setQueriesData({ queryKey: ["vault"] }, (old: any) => {
        if (!old) return old;

        const updateAuthor = (v: any) =>
          v.author?.id === id
            ? { ...v, author: { ...v.author, isFollowing: false } }
            : v;

        if (old.author?.id) return updateAuthor(old);
        if (Array.isArray(old)) return old.map(updateAuthor);
        if (old.data) {
          if (Array.isArray(old.data)) {
            return { ...old, data: old.data.map(updateAuthor) };
          }
          if (old.data.data && Array.isArray(old.data.data)) {
            return {
              ...old,
              data: { ...old.data, data: old.data.data.map(updateAuthor) },
            };
          }
        }
        return old;
      });

      // Update following status in ALL user lists
      queryClient.setQueriesData({ queryKey: userKeys.all() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) =>
          p.id === id
            ? {
                ...p,
                isFollowing: false,
                followersCount: Math.max(0, (p.followersCount || 0) - 1),
              }
            : p,
        );
      });

      // SPECIAL: Remove from own following list immediately
      if (previousOwnProfile?.id) {
        queryClient.setQueryData(
          userKeys.getFollowing(previousOwnProfile.id),
          (old: any) => {
            if (!Array.isArray(old)) return old;
            return old.filter((p: any) => p.id !== id);
          },
        );
      }

      // SPECIAL: Remove their vaults from the following feed immediately
      queryClient.setQueriesData(
        { queryKey: ["vault", "following"] },
        (old: any) => {
          if (!old) return old;
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.filter((v: any) => v.author?.id !== id),
            };
          }
          if (Array.isArray(old)) {
            return old.filter((v: any) => v.author?.id !== id);
          }
          return old;
        },
      );

      return { previousPublicProfile, previousOwnProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context:
        | { previousPublicProfile?: PublicProfile; previousOwnProfile?: User }
        | undefined,
    ) => {
      if (context?.previousPublicProfile) {
        queryClient.setQueryData(
          userKeys.getPublicProfile(id),
          context.previousPublicProfile,
        );
      }
      if (context?.previousOwnProfile) {
        queryClient.setQueryData(
          userKeys.getProfile(),
          context.previousOwnProfile,
        );
      }
    },
  });

  const respondToTagMutation = (notificationId: string) => ({
    mutationKey: [...userKeys.notifications(), "respond", notificationId],
    mutationFn: async (action: "accepted" | "declined") => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        `/vault/tag/notifications/${notificationId}/respond`,
        { status: action },
      );
      return response.data;
    },
    onMutate: async (action: "accepted" | "declined") => {
      await queryClient.cancelQueries({ queryKey: userKeys.notifications() });
      await queryClient.cancelQueries({ queryKey: userKeys.taggedVaults() });

      const previousNotifications = queryClient.getQueryData<
        VaultTagNotification[]
      >(userKeys.notifications());
      const previousTaggedVaults = queryClient.getQueryData<Vault[]>(
        userKeys.taggedVaults(),
      );

      const respondingNotification = previousNotifications?.find(
        (n) => n.id === notificationId,
      );

      if (previousNotifications) {
        queryClient.setQueryData<VaultTagNotification[]>(
          userKeys.notifications(),
          previousNotifications.filter((n) => n.id !== notificationId),
        );
      }

      if (action === "accepted" && respondingNotification) {
        const newTaggedVault: Vault = {
          id: respondingNotification.vaultId,
          title: respondingNotification.vaultTitle,
          description: "", // Fallback
          tags: [],
          mood: null,
          location: null,
          visibility: "public",
          audience: "everyone",
          allowComments: true,
          attachments: respondingNotification.vaultCoverUrl
            ? [{ url: respondingNotification.vaultCoverUrl, type: "image" }]
            : [],
          status: "publish",
          author: respondingNotification.tagger,
          tagStatus: "accepted",
          scheduledAt: null,
          createdAt: respondingNotification.createdAt,
        };

        if (previousTaggedVaults) {
          queryClient.setQueryData<Vault[]>(userKeys.taggedVaults(), [
            newTaggedVault,
            ...previousTaggedVaults,
          ]);
        }
      }

      return { previousNotifications, previousTaggedVaults };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context:
        | {
            previousNotifications?: VaultTagNotification[];
            previousTaggedVaults?: Vault[];
          }
        | undefined,
    ) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          userKeys.notifications(),
          context.previousNotifications,
        );
      }
      if (context?.previousTaggedVaults) {
        queryClient.setQueryData(
          userKeys.taggedVaults(),
          context.previousTaggedVaults,
        );
      }
    },
  });

  return {
    profileMutation,
    updateProfileMutation,
    followMutation,
    unfollowMutation,
    respondToTagMutation,
  };
};
