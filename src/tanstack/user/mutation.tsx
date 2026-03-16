import { userKeys } from "./keys";
import { set } from "idb-keyval";
import type { User, PublicProfile } from "../../types/user";
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

      // Update following status in ALL user lists (followers, following, etc.)
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

      return { previousPublicProfile, previousOwnProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context:
        | { previousPublicProfile?: PublicProfile; previousOwnProfile?: User }
        | undefined,
    ) => {
      // Revert accurately via invalidation
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });

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
      // Revert accurately via invalidation
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      queryClient.invalidateQueries({ queryKey: userKeys.all() });

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

  return {
    profileMutation,
    updateProfileMutation,
    followMutation,
    unfollowMutation,
  };
};
