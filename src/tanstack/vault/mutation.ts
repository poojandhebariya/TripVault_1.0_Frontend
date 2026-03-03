import { vaultKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../pages/types/api-response";
import type { Vault } from "../../pages/types/vault";

export const vaultMutation = () => {
  const createVaultMutation = {
    mutationKey: vaultKeys.create(),
    mutationFn: async (payload: Vault): Promise<Vault> => {
      const response = await axiosInstance.post<ApiResponse<Vault>>(
        "/vault/create",
        payload,
      );
      return response.data.data;
    },
  };

  return { createVaultMutation };
};
