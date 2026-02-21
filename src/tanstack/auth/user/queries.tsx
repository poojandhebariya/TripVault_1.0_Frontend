import { set } from "idb-keyval";
import type { ApiResponse } from "../../../pages/types/api-response";
import type { User } from "../../../pages/types/user";
import axiosInstance from "../../../utils/axios-instance";
import { userKeys } from "./keys";

export const userQueries = () => {
  const getProfile = () => ({
    queryKey: userKeys.getProfile(),
    queryFn: async (): Promise<ApiResponse<User>> => {
      const response =
        await axiosInstance.get<ApiResponse<User>>("/user/profile");
      await set("user", response.data.data);
      return response.data;
    },
  });

  return { getProfile };
};
