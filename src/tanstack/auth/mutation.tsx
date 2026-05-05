import { authKeys } from "./keys";
import axiosInstance, { saveTokens } from "../../utils/axios-instance";
import type { AuthResponse } from "../../types/auth-response";
import type { ApiResponse } from "../../types/api-response";
import { useQueryClient } from "@tanstack/react-query";
import { getDeviceInfo } from "../../utils/device-info";
import { clear } from "idb-keyval";

export const authMutation = () => {
  const queryClient = useQueryClient();

  // ─── Helper: register device session after login ────────────────────────────
  const registerSessionAfterLogin = async () => {
    try {
      const info = getDeviceInfo();
      const response = await axiosInstance.post<ApiResponse<string>>(
        "/auth/sessions/register",
        info,
      );
      const sessionId = response.data.data;
      if (sessionId) localStorage.setItem("sessionId", sessionId);
    } catch {
      // Non-critical — session tracking is best-effort
    }
  };

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
      await registerSessionAfterLogin();
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
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/change-password",
        data,
      );
      return response.data;
    },
  };

  // ─────────────────────── 2FA ───────────────────────

  const twoFaSetupMutation = {
    mutationKey: authKeys.twoFaSetup(),
    mutationFn: async () => {
      const response =
        await axiosInstance.post<ApiResponse<null>>("/auth/2fa/setup");
      return response.data;
    },
  };

  const twoFaVerifyMutation = {
    mutationKey: authKeys.twoFaVerify(),
    mutationFn: async (data: { code: string }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/2fa/verify",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.twoFaStatus() });
    },
  };

  const twoFaDisableMutation = {
    mutationKey: authKeys.twoFaDisable(),
    mutationFn: async () => {
      const response =
        await axiosInstance.delete<ApiResponse<null>>("/auth/2fa/disable");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.twoFaStatus() });
    },
  };

  const twoFaLoginVerifyMutation = {
    mutationKey: authKeys.twoFaLoginVerify(),
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        "/auth/2fa/login-verify",
        data,
      );
      return response.data;
    },
    onSuccess: async (data: ApiResponse<AuthResponse>) => {
      await saveTokens(data.data);
      queryClient.clear();
      await registerSessionAfterLogin();
    },
  };

  const changeEmailInitiateMutation = {
    mutationKey: authKeys.changeEmailInitiate(),
    mutationFn: async (data: { newEmail: string }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/change-email/initiate",
        data,
      );
      return response.data;
    },
  };

  const changeEmailConfirmMutation = {
    mutationKey: authKeys.changeEmailConfirm(),
    mutationFn: async (data: { code: string; newEmail?: string }) => {
      const response = await axiosInstance.post<ApiResponse<null>>(
        "/auth/change-email/confirm",
        { code: data.code },
      );
      return response.data;
    },
    onMutate: async (newData: { code: string; newEmail?: string }) => {
      if (!newData.newEmail) return;

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: authKeys.linkedEmail() });

      // Snapshot the previous value
      const previousEmail = queryClient.getQueryData(authKeys.linkedEmail());

      // Optimistically update to the new value
      queryClient.setQueryData(authKeys.linkedEmail(), newData.newEmail);

      // Return a context object with the snapshotted value
      return { previousEmail };
    },
    onError: (_err: any, _newData: any, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEmail) {
        queryClient.setQueryData(authKeys.linkedEmail(), context.previousEmail);
      }
    },
  };

  const revokeSessionMutation = {
    mutationKey: [...authKeys.sessions(), "revoke"],
    mutationFn: async (sessionId: string) => {
      const currentSessionId = localStorage.getItem("sessionId");
      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/auth/sessions/${sessionId}`,
        {
          headers: currentSessionId ? { "X-Session-Id": currentSessionId } : {},
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
  };

  const revokeOtherSessionsMutation = {
    mutationKey: [...authKeys.sessions(), "revoke-others"],
    mutationFn: async () => {
      const currentSessionId = localStorage.getItem("sessionId");
      const response = await axiosInstance.delete<ApiResponse<null>>(
        "/auth/sessions/others",
        {
          headers: currentSessionId ? { "X-Session-Id": currentSessionId } : {},
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
    },
  };

  const deleteAccountMutation = {
    mutationKey: authKeys.deleteAccount(),
    mutationFn: async () => {
      const response =
        await axiosInstance.delete<ApiResponse<string>>("/auth/account");
      return response.data;
    },
    onSuccess: async () => {
      localStorage.clear();
      await clear();
      queryClient.clear();
      window.location.href = "/";
    },
  };

  return {
    loginMutation,
    signUpMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    changePasswordMutation,
    twoFaSetupMutation,
    twoFaVerifyMutation,
    twoFaDisableMutation,
    twoFaLoginVerifyMutation,
    changeEmailInitiateMutation,
    changeEmailConfirmMutation,
    revokeSessionMutation,
    revokeOtherSessionsMutation,
    deleteAccountMutation,
  };
};
