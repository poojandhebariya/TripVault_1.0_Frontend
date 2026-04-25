import { authKeys } from "./keys";
import axiosInstance, { saveTokens } from "../../utils/axios-instance";
import type { AuthResponse } from "../../types/auth-response";
import type { ApiResponse } from "../../types/api-response";
import { useQueryClient } from "@tanstack/react-query";

export const authMutation = () => {
  const queryClient = useQueryClient();
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
      await saveTokens(data.data);
      queryClient.clear();
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
      await saveTokens(data.data);
      queryClient.clear();
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

  const changePasswordMutation = {
    mutationKey: authKeys.changePassword(),
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/change-password",
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
    changePasswordMutation,
  };
};
