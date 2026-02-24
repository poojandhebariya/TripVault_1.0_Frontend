import { userKeys } from "./keys";
import { set } from "idb-keyval";
import type { User } from "../../../pages/types/user";
import axiosInstance from "../../../utils/axios-instance";
import type { ApiResponse } from "../../../pages/types/api-response";
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

  return {
    profileMutation,
    updateProfileMutation,
  };
};
