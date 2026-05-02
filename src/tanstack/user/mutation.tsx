import { userKeys } from "./keys";
import { set } from "idb-keyval";
import type { User, PublicProfile } from "../../types/user";
import type { VaultNotification } from "../../types/notifications";
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
        const isTargetPrivate = previousPublicProfile.privateAccount;
        queryClient.setQueryData<PublicProfile>(userKeys.getPublicProfile(id), {
          ...previousPublicProfile,
          isFollowing: !isTargetPrivate,
          requestPending: isTargetPrivate,
          followersCount: isTargetPrivate
            ? previousPublicProfile.followersCount
            : (previousPublicProfile.followersCount || 0) + 1,
        });
      }

      // Optimistically update own following count
      if (previousOwnProfile) {
        const isTargetPrivate = previousPublicProfile?.privateAccount;
        queryClient.setQueryData<User>(userKeys.getProfile(), {
          ...previousOwnProfile,
          followingCount: isTargetPrivate
            ? previousOwnProfile.followingCount
            : (previousOwnProfile.followingCount || 0) + 1,
        });
      }

      // Optimistically update author status in ALL vault lists
      queryClient.setQueriesData({ queryKey: ["vault"] }, (old: any) => {
        if (!old) return old;

        const isTargetPrivate = previousPublicProfile?.privateAccount;
        const updateAuthor = (v: any) => {
          if (v.author?.id !== id) return v;

          const isTargetPrivate = previousPublicProfile?.privateAccount ?? v.author.privateAccount;
          return {
            ...v,
            author: {
              ...v.author,
              isFollowing: !isTargetPrivate,
              requestPending: isTargetPrivate,
            },
          };
        };

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

      // Update following status in ALL user lists (followers, following, search, suggestions, etc.)
      queryClient.setQueriesData({ queryKey: userKeys.all() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) => {
          if (p.id !== id) return p;
          
          const isTargetPrivate = previousPublicProfile?.privateAccount ?? p.privateAccount ?? false;
          return {
            ...p,
            isFollowing: !isTargetPrivate,
            requestPending: isTargetPrivate,
            followersCount: isTargetPrivate
              ? p.followersCount
              : (p.followersCount || 0) + 1,
          };
        });
      });

      // SPECIAL: Inject the newly followed user into the current user's following list
      if (previousOwnProfile?.id) {
        const followedProfile: PublicProfile | undefined =
          previousPublicProfile ??
          (
            queryClient.getQueryData<PublicProfile[]>(
              userKeys.getSuggestedProfiles(),
            ) ?? []
          ).find((p: PublicProfile) => p.id === id);

        if (followedProfile && !followedProfile.privateAccount) {
          queryClient.setQueryData(
            userKeys.getFollowing(previousOwnProfile.id),
            (old: any) => {
              const list: PublicProfile[] = Array.isArray(old) ? old : [];
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["vault"] });
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
      await queryClient.cancelQueries({ queryKey: userKeys.all() });
      await queryClient.cancelQueries({ queryKey: ["vault"] });

      const previousPublicProfile = queryClient.getQueryData<PublicProfile>(
        userKeys.getPublicProfile(id),
      );
      const previousOwnProfile = queryClient.getQueryData<User>(
        userKeys.getProfile(),
      );

      if (previousPublicProfile) {
        queryClient.setQueryData<PublicProfile>(userKeys.getPublicProfile(id), {
          ...previousPublicProfile,
          isFollowing: false,
          requestPending: false,
          followersCount: Math.max(
            0,
            (previousPublicProfile.followersCount || 0) - 1,
          ),
        });
      }

      if (previousOwnProfile) {
        queryClient.setQueryData<User>(userKeys.getProfile(), {
          ...previousOwnProfile,
          followingCount: Math.max(
            0,
            (previousOwnProfile.followingCount || 0) - 1,
          ),
        });
      }

      queryClient.setQueriesData({ queryKey: ["vault"] }, (old: any) => {
        if (!old) return old;

        const updateAuthor = (v: any) =>
          v.author?.id === id
            ? {
                ...v,
                author: { ...v.author, isFollowing: false, requestPending: false },
              }
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

      queryClient.setQueriesData({ queryKey: userKeys.all() }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) =>
          p.id === id
            ? {
                ...p,
                isFollowing: false,
                requestPending: false,
                followersCount: Math.max(0, (p.followersCount || 0) - 1),
              }
            : p,
        );
      });

      if (previousOwnProfile?.id) {
        queryClient.setQueryData(
          userKeys.getFollowing(previousOwnProfile.id),
          (old: any) => {
            if (!Array.isArray(old)) return old;
            return old.filter((p: any) => p.id !== id);
          },
        );
      }

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      queryClient.invalidateQueries({ queryKey: ["vault"] });
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
        VaultNotification[]
      >(userKeys.notifications());
      const previousTaggedVaults = queryClient.getQueryData<Vault[]>(
        userKeys.taggedVaults(),
      );

      const respondingNotification = previousNotifications?.find(
        (n) => n.id === notificationId,
      );

      if (previousNotifications) {
        queryClient.setQueryData<VaultNotification[]>(
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
          author: respondingNotification.actor,
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
            previousNotifications?: VaultNotification[];
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

  const markNotificationsAsReadMutation = () => ({
    mutationKey: [...userKeys.notifications(), "read"],
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse<null>>(`/vault/notifications/read`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKeys.notifications() });
      const previousNotifications = queryClient.getQueryData<VaultNotification[]>(userKeys.notifications());

      if (previousNotifications) {
        queryClient.setQueryData<VaultNotification[]>(
          userKeys.notifications(),
          previousNotifications.map((n) => ({ ...n, isRead: true }))
        );
      }

      return { previousNotifications };
    },
    onError: (_err: unknown, _vars: unknown, context: { previousNotifications?: VaultNotification[] } | undefined) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(userKeys.notifications(), context.previousNotifications);
      }
    },
  });

  const updatePrivacyMutation = () => ({
    mutationKey: userKeys.updatePrivacy(),
    mutationFn: async (settings: { privateAccount: boolean; showInSearch: boolean; allowTagging: boolean }) => {
      const response = await axiosInstance.patch<ApiResponse<null>>(
        "/user/privacy",
        settings,
      );
      return response.data;
    },
    onMutate: async (settings: { privateAccount: boolean; showInSearch: boolean; allowTagging: boolean }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.getProfile() });
      const previousUser = queryClient.getQueryData<User>(userKeys.getProfile());
      if (previousUser) {
        queryClient.setQueryData<User>(userKeys.getProfile(), {
          ...previousUser,
          privateAccount: settings.privateAccount,
          showInSearch: settings.showInSearch,
          allowTagging: settings.allowTagging,
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
    onSuccess: async (_data, settings) => {
      const previousUser = queryClient.getQueryData<User>(userKeys.getProfile());
      if (previousUser) {
        const updatedUser = {
          ...previousUser,
          privateAccount: settings.privateAccount,
          showInSearch: settings.showInSearch,
          allowTagging: settings.allowTagging,
        };
        await set("user", updatedUser);
        await queryClient.setQueryData(userKeys.getProfile(), updatedUser);
      }
    },
  });

  const acceptFollowRequestMutation = (requestorId: string) => ({
    mutationKey: [...userKeys.followRequests(), "accept", requestorId],
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        `/user/follow-requests/${requestorId}/accept`,
      );
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKeys.notifications() });
      await queryClient.cancelQueries({ queryKey: userKeys.getProfile() });

      const previousNotifications = queryClient.getQueryData<VaultNotification[]>(userKeys.notifications());
      const previousProfile = queryClient.getQueryData<import('../../types/user').User>(userKeys.getProfile());

      // Optimistically remove the FOLLOW_REQUEST card from the notifications list
      if (previousNotifications) {
        queryClient.setQueryData<VaultNotification[]>(
          userKeys.notifications(),
          previousNotifications.filter(
            (n) => !(n.type === "FOLLOW_REQUEST" && n.actor?.id === requestorId),
          ),
        );
      }

      // Optimistically bump followers count on own profile
      if (previousProfile) {
        queryClient.setQueryData(userKeys.getProfile(), {
          ...previousProfile,
          followersCount: (previousProfile.followersCount || 0) + 1,
        });
      }

      return { previousNotifications, previousProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousNotifications?: VaultNotification[]; previousProfile?: import('../../types/user').User } | undefined,
    ) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(userKeys.notifications(), context.previousNotifications);
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.getProfile(), context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: userKeys.followRequests() });
      queryClient.invalidateQueries({ queryKey: userKeys.getProfile() });
    },
  });

  const declineFollowRequestMutation = (requestorId: string) => ({
    mutationKey: [...userKeys.followRequests(), "decline", requestorId],
    mutationFn: async () => {
      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/user/follow-requests/${requestorId}`,
      );
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKeys.notifications() });

      const previousNotifications = queryClient.getQueryData<VaultNotification[]>(userKeys.notifications());

      // Optimistically remove the FOLLOW_REQUEST card from the notifications list
      if (previousNotifications) {
        queryClient.setQueryData<VaultNotification[]>(
          userKeys.notifications(),
          previousNotifications.filter(
            (n) => !(n.type === "FOLLOW_REQUEST" && n.actor?.id === requestorId),
          ),
        );
      }

      return { previousNotifications };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousNotifications?: VaultNotification[] } | undefined,
    ) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(userKeys.notifications(), context.previousNotifications);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: userKeys.followRequests() });
    },
  });

  const recordProfileVisitMutation = (profileId: string) => ({
    mutationKey: [...userKeys.all(), "profileVisit", profileId],
    mutationFn: async () => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        `/user/profile/${profileId}/visit`,
      );
      return response.data;
    },
  });

  const recordProfileTimeSpentMutation = (profileId: string) => ({
    mutationKey: [...userKeys.all(), "profileTimeSpent", profileId],
    mutationFn: async (seconds: number) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        `/user/profile/${profileId}/time`,
        { seconds },
      );
      return response.data;
    },
  });

  return {
    profileMutation,
    updateProfileMutation,
    followMutation,
    unfollowMutation,
    respondToTagMutation,
    markNotificationsAsReadMutation,
    updatePrivacyMutation,
    acceptFollowRequestMutation,
    declineFollowRequestMutation,
    recordProfileVisitMutation,
    recordProfileTimeSpentMutation,
  };
};
