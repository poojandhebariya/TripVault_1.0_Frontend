import { authKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";
import type { Session } from "../../types/session";
import type { LoginActivity } from "../../types/login-activity";

export const twoFaStatusQuery = () => ({
  queryKey: authKeys.twoFaStatus(),
  queryFn: async () => {
    const response = await axiosInstance.get<ApiResponse<{ enabled: boolean }>>(
      "/auth/2fa/status",
    );
    return response.data.data;
  },
});

export const linkedEmailQuery = () => ({
  queryKey: authKeys.linkedEmail(),
  queryFn: async () => {
    const response = await axiosInstance.get<ApiResponse<string>>(
      "/auth/linked-email",
    );
    return response.data.data; // plain email string
  },
  staleTime: 1000 * 60 * 5, // 5 min — email rarely changes
});


export const sessionsQuery = () => ({
  queryKey: authKeys.sessions(),
  queryFn: async (): Promise<Session[]> => {
    const sessionId = localStorage.getItem("sessionId");
    const response = await axiosInstance.get<ApiResponse<Session[]>>(
      "/auth/sessions",
      { headers: sessionId ? { "X-Session-Id": sessionId } : {} },
    );
    return response.data.data ?? [];
  },
  staleTime: 0, // always fresh
});

export const loginActivityQuery = () => ({
  queryKey: authKeys.loginActivity(),
  queryFn: async (): Promise<LoginActivity[]> => {
    const response = await axiosInstance.get<ApiResponse<LoginActivity[]>>(
      "/auth/login-activity",
    );
    return response.data.data ?? [];
  },
  staleTime: 0,
});
