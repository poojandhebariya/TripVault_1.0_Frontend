import { set } from "idb-keyval";
import type { ApiResponse } from "../../types/api-response";
import type { User, PublicProfile } from "../../types/user";
import axiosInstance from "../../utils/axios-instance";
import { userKeys } from "./keys";

export const userQueries = () => {
  const getProfile = () => ({
    queryKey: userKeys.getProfile(),
    queryFn: async (): Promise<User> => {
      const response =
        await axiosInstance.get<ApiResponse<User>>("/user/profile");
      await set("user", response.data.data);
      return response.data.data as User;
    },
  });

  const getPublicProfile = (id: string) => ({
    queryKey: userKeys.getPublicProfile(id),
    queryFn: async (): Promise<PublicProfile> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile>>(
        `/user/profile/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });

  const getFollowers = (userId: string) => ({
    queryKey: userKeys.getFollowers(userId),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/${userId}/followers`,
      );
      return response.data.data;
    },
    enabled: !!userId,
  });

  const getFollowing = (userId: string) => ({
    queryKey: userKeys.getFollowing(userId),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/${userId}/following`,
      );
      return response.data.data;
    },
    enabled: !!userId,
  });

  const getSuggestedProfiles = () => ({
    queryKey: userKeys.getSuggestedProfiles(),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/suggested`,
      );
      return response.data.data;
    },
  });

  return { getProfile, getPublicProfile, getFollowers, getFollowing, getSuggestedProfiles };
};
