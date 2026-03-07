import axiosInstance from "../../utils/axios-instance";
import type {
  ApiResponse,
  PaginatedResponse,
} from "../../pages/types/api-response";
import type { Vault } from "../../pages/types/vault";
import { vaultKeys } from "./keys";

export const vaultQueries = () => {
  const getMyVaults = () => ({
    queryKey: vaultKeys.getMyVaults(),
    queryFn: async (): Promise<Vault[]> => {
      const response =
        await axiosInstance.get<ApiResponse<Vault[]>>("/vault/my-vaults");
      return response.data.data;
    },
  });

  const getPublicVaults = (page = 1, limit = 10) => ({
    queryKey: [...vaultKeys.getPublicVaults(), page],
    queryFn: async (): Promise<PaginatedResponse<Vault>> => {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Vault>>
      >(`/vault/public?page=${page}&limit=${limit}`);
      return response.data.data;
    },
  });

  const getNearbyVaults = (
    lat: number,
    lng: number,
    radius = 50,
    page = 1,
    limit = 10,
  ) => ({
    queryKey: vaultKeys.getNearbyVaults(lat, lng, radius, page),
    queryFn: async (): Promise<PaginatedResponse<Vault>> => {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Vault>>
      >(
        `/vault/nearby?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`,
      );
      return response.data.data;
    },
  });

  const getVaultDetails = (id: string) => ({
    queryKey: vaultKeys.getVaultDetails(id),
    queryFn: async (): Promise<Vault> => {
      const response = await axiosInstance.get<ApiResponse<Vault>>(
        `/vault/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });

  return { getMyVaults, getPublicVaults, getNearbyVaults, getVaultDetails };
};
