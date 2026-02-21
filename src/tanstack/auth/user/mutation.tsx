import { userKeys } from "./keys";
import { set } from "idb-keyval";
import type { User } from "../../../pages/types/user";
import axiosInstance from "../../../utils/axios-instance";
import type { ApiResponse } from "../../../pages/types/api-response";

export const userMutation = () => {
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

  return {
    profileMutation,
  };
};
