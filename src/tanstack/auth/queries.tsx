import { authKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";

export const twoFaStatusQuery = () => ({
  queryKey: authKeys.twoFaStatus(),
  queryFn: async () => {
    const response = await axiosInstance.get<ApiResponse<{ enabled: boolean }>>(
      "/auth/2fa/status",
    );
    return response.data.data;
  },
});
