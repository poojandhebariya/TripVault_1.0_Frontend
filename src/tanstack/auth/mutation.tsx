import { authKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { AuthResponse } from "../../pages/types/auth-response";
import { set } from "idb-keyval";
import type { ApiResponse } from "../../pages/types/api-response";

export const authMutation = () => {
  const loginMutation = {
    mutationKey: authKeys.login(),
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        "/auth/sign-in",
        data,
      );
      return response.data;
    },
    onSuccess: async (data: ApiResponse<AuthResponse>) => {
      await set("bearerToken", data.data);
    },
  };

  const signUpMutation = {
    mutationKey: authKeys.signUp(),
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        "/auth/sign-up",
        data,
      );
      return response.data;
    },
    onSuccess: async (data: ApiResponse<AuthResponse>) => {
      await set("bearerToken", data.data);
    },
  };

  const forgotPasswordMutation = {
    mutationKey: authKeys.forgotPassword(),
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/forgot-password",
        data,
      );
      return response.data;
    },
  };

  const resetPasswordMutation = {
    mutationKey: authKeys.resetPassword(),
    mutationFn: async (data: {
      email: string;
      code: string;
      newPassword: string;
    }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/reset-password",
        data,
      );
      return response.data;
    },
  };

  return {
    loginMutation,
    signUpMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
  };
};
