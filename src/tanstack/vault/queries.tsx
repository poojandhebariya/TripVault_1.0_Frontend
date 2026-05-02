import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response";
import type { Vault, VaultComment } from "../../types/vault";
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

  const getComments = (vaultId: string, limit = 10) => ({
    queryKey: [...vaultKeys.getComments(vaultId)],
    queryFn: async ({
      pageParam = 1,
    }: {
      pageParam?: number;
    }): Promise<PaginatedResponse<VaultComment>> => {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<VaultComment>>
      >(`/vault/${vaultId}/comments?page=${pageParam}&limit=${limit}`);
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<VaultComment>) => {
      if (lastPage.page < lastPage.totalPages) return lastPage.page + 1;
      return undefined;
    },
    enabled: !!vaultId,
  });

  const getSavedVaults = () => ({
    queryKey: vaultKeys.getSavedVaults(),
    queryFn: async (): Promise<Vault[]> => {
      const response =
        await axiosInstance.get<ApiResponse<Vault[]>>("/vault/saved");
      return response.data.data;
    },
  });

  const getUserPublicVaults = (id: string) => ({
    queryKey: [...vaultKeys.all(), "user-public", id],
    queryFn: async (): Promise<Vault[]> => {
      const response = await axiosInstance.get<ApiResponse<Vault[]>>(
        `/vault/user/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });

  const getFollowingVaults = (page = 1, limit = 10) => ({
    queryKey: [...vaultKeys.getFollowingVaults(), page],
    queryFn: async (): Promise<PaginatedResponse<Vault>> => {
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Vault>>
      >(`/vault/following?page=${page}&limit=${limit}`);
      return response.data.data;
    },
  });

  const getVaultsByPlace = (
    placeName: string,
    placeLocation: string,
    page = 1,
    limit = 10,
  ) => ({
    queryKey: vaultKeys.getVaultsByPlace(placeName, placeLocation, page),
    queryFn: async (): Promise<PaginatedResponse<Vault>> => {
      const params = new URLSearchParams({
        placeName,
        placeLocation,
        page: String(page),
        limit: String(limit),
      });
      const response = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Vault>>
      >(`/vault/by-place?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!placeName.trim(),
  });

  const getVaultTimeStats = () => ({
    queryKey: vaultKeys.vaultTimeStats(),
    queryFn: async (): Promise<{
      avgSessionSeconds: number;
      industryAvgSeconds: number;
      aboveIndustryPct: number;
      topVaults: {
        vaultId: string;
        title: string;
        avgSeconds: number;
        totalSessions: number;
      }[];
    }> => {
      const response = await axiosInstance.get<
        ApiResponse<{
          avgSessionSeconds: number;
          industryAvgSeconds: number;
          aboveIndustryPct: number;
          topVaults: {
            vaultId: string;
            title: string;
            avgSeconds: number;
            totalSessions: number;
          }[];
        }>
      >(`/vault/time/stats`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const getVaultEngagementStats = () => ({
    queryKey: [...vaultKeys.all(), "engagement-stats"],
    queryFn: async (): Promise<{
      topByImpressions: Vault[];
      topByEngagement: Vault[];
    }> => {
      const response = await axiosInstance.get<
        ApiResponse<{
          topByImpressions: Vault[];
          topByEngagement: Vault[];
        }>
      >(`/vault/stats/engagement`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    getMyVaults,
    getPublicVaults,
    getNearbyVaults,
    getVaultDetails,
    getComments,
    getSavedVaults,
    getUserPublicVaults,
    getFollowingVaults,
    getVaultsByPlace,
    getVaultTimeStats,
    getVaultEngagementStats,
  };
};
