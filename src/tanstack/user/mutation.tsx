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
    onSuccess: async (data: ApiResponse<User>) => {
      await set("user", data.data);
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
      // Cancel any in-flight queries for this profile
      await queryClient.cancelQueries({
        queryKey: userKeys.getPublicProfile(id),
      });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<PublicProfile>(
        userKeys.getPublicProfile(id),
      );

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<PublicProfile>(
          userKeys.getPublicProfile(id),
          {
            ...previousProfile,
            isFollowing: true,
            followersCount: previousProfile.followersCount + 1,
          },
        );
      }

      return { previousProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousProfile?: PublicProfile } | undefined,
    ) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          userKeys.getPublicProfile(id),
          context.previousProfile,
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
      await queryClient.cancelQueries({
        queryKey: userKeys.getPublicProfile(id),
      });

      const previousProfile = queryClient.getQueryData<PublicProfile>(
        userKeys.getPublicProfile(id),
      );

      if (previousProfile) {
        queryClient.setQueryData<PublicProfile>(
          userKeys.getPublicProfile(id),
          {
            ...previousProfile,
            isFollowing: false,
            followersCount: Math.max(0, previousProfile.followersCount - 1),
          },
        );
      }

      return { previousProfile };
    },
    onError: (
      _err: unknown,
      _vars: unknown,
      context: { previousProfile?: PublicProfile } | undefined,
    ) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          userKeys.getPublicProfile(id),
          context.previousProfile,
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
