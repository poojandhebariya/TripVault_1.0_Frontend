import { set } from "idb-keyval";
import type { ApiResponse } from "../../types/api-response";
import type { User, PublicProfile } from "../../types/user";
import type { VaultNotification } from "../../types/notifications";
import type { Vault } from "../../types/vault";
import axiosInstance from "../../utils/axios-instance";
import { userKeys } from "./keys";

export const userQueries = () => {
  const getProfile = () => ({
    queryKey: userKeys.getProfile(),
    queryFn: async (): Promise<User> => {
      const response =
        await axiosInstance.get<ApiResponse<User>>("/user/profile");
      await set("user", response.data.data);
      return response.data.data as User;
    },
  });

  const checkUsername = (username: string) => ({
    queryKey: userKeys.checkUsername(username),
    queryFn: async (): Promise<{ available: boolean }> => {
      const response = await axiosInstance.get<
        ApiResponse<{ available: boolean }>
      >(`/user/check-username?username=${encodeURIComponent(username)}`);
      return response.data.data as { available: boolean };
    },
    enabled: username.length >= 3,
    staleTime: 1000 * 30, // cache 30s per username
  });

  const getPublicProfile = (id: string) => ({
    queryKey: userKeys.getPublicProfile(id),
    queryFn: async (): Promise<PublicProfile> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile>>(
        `/user/profile/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });

  const getFollowers = (userId: string) => ({
    queryKey: userKeys.getFollowers(userId),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/${userId}/followers`,
      );
      return response.data.data;
    },
    enabled: !!userId,
  });

  const getFollowing = (userId: string) => ({
    queryKey: userKeys.getFollowing(userId),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/${userId}/following`,
      );
      return response.data.data;
    },
    enabled: !!userId,
  });

  const getSuggestedProfiles = () => ({
    queryKey: userKeys.getSuggestedProfiles(),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response =
        await axiosInstance.get<ApiResponse<PublicProfile[]>>(
          `/user/suggested`,
        );
      return response.data.data;
    },
  });

  const getNotifications = () => ({
    queryKey: userKeys.notifications(),
    queryFn: async (): Promise<VaultNotification[]> => {
      const response = await axiosInstance.get<ApiResponse<VaultNotification[]>>(
        `/vault/notifications`,
      );
      return response.data.data ?? [];
    },
  });

  const getTaggedVaults = () => ({
    queryKey: userKeys.taggedVaults(),
    queryFn: async (): Promise<Vault[]> => {
      const response = await axiosInstance.get<ApiResponse<Vault[]>>(
        `/vault/tagged`,
      );
      return response.data.data ?? [];
    },
  });

  const getPublicTaggedVaults = (userId: string) => ({
    queryKey: userKeys.getPublicTaggedVaults(userId),
    queryFn: async (): Promise<Vault[]> => {
      const response = await axiosInstance.get<ApiResponse<Vault[]>>(
        `/vault/user/${userId}/tagged`,
      );
      return response.data.data ?? [];
    },
    enabled: !!userId,
  });

  const tagFollowersInVault = (q: string) => ({
    queryKey: userKeys.tagFollowersInVault(q),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/followers/search?q=${encodeURIComponent(q)}&limit=6`,
      );
      return response.data.data ?? [];
    },
    enabled: q.length >= 1,
    staleTime: 1000 * 30, // 30s
  });

  const searchUsers = (q: string) => ({
    queryKey: userKeys.searchUsers(q),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/search?q=${encodeURIComponent(q)}&limit=6`,
      );
      return response.data.data ?? [];
    },
    enabled: q.length >= 1,
    staleTime: 1000 * 30, // 30s
  });

  const getFollowRequests = () => ({
    queryKey: userKeys.followRequests(),
    queryFn: async (): Promise<PublicProfile[]> => {
      const response = await axiosInstance.get<ApiResponse<PublicProfile[]>>(
        `/user/follow-requests`,
      );
      return response.data.data ?? [];
    },
  });

  const getProfileVisitStats = () => ({
    queryKey: userKeys.profileVisitStats(),
    queryFn: async (): Promise<{
      totalVisits: number;
      last30Days: number;
      yearlyData: { year: number; visits: number }[];
    }> => {
      const response = await axiosInstance.get<
        ApiResponse<{
          totalVisits: number;
          last30Days: number;
          yearlyData: { year: number; visits: number }[];
        }>
      >(`/user/profile/visits/stats`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const getProfileTimeStats = () => ({
    queryKey: userKeys.profileTimeStats(),
    queryFn: async (): Promise<{
      avgSessionSeconds: number;
      industryAvgSeconds: number;
      aboveIndustryPct: number;
      topVaults: { id: string; title: string; pct: number; views: number }[];
    }> => {
      const response = await axiosInstance.get<
        ApiResponse<{
          avgSessionSeconds: number;
          industryAvgSeconds: number;
          aboveIndustryPct: number;
          topVaults: { id: string; title: string; pct: number; views: number }[];
        }>
      >(`/user/profile/time/stats`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const getReachStats = () => ({
    queryKey: userKeys.reachStats(),
    queryFn: async (): Promise<{ country: string; count: number; level: "high" | "medium" | "low" }[]> => {
      const response = await axiosInstance.get<
        ApiResponse<{ country: string; count: number; level: "high" | "medium" | "low" }[]>
      >(`/user/profile/reach/stats`);
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const getDistanceStats = () => ({
    queryKey: userKeys.distanceStats(),
    queryFn: async (): Promise<{
      totalKm: number;
      earthRatio: number;
      nextMilestoneKm: number;
      remainingKm: number;
      totalVaultsWithLocation: number;
      continents: { continent: string; vaults: number }[];
      monthly: { month: string; vaults: number }[];
    }> => {
      const response = await axiosInstance.get<
        ApiResponse<{
          totalKm: number;
          earthRatio: number;
          nextMilestoneKm: number;
          remainingKm: number;
          totalVaultsWithLocation: number;
          continents: { continent: string; vaults: number }[];
          monthly: { month: string; vaults: number }[];
        }>
      >(`/user/profile/distance/stats`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  return {
    getProfile,
    checkUsername,
    getPublicProfile,
    getFollowers,
    getFollowing,
    getSuggestedProfiles,
    getNotifications,
    getTaggedVaults,
    getPublicTaggedVaults,
    tagFollowersInVault,
    searchUsers,
    getFollowRequests,
    getProfileVisitStats,
    getProfileTimeStats,
    getReachStats,
    getDistanceStats,
  };
};
