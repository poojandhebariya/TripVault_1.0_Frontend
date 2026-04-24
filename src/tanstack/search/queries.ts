import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";
import type { SearchResult } from "../../types/search";
import { searchKeys } from "./keys";

export const searchQueries = () => {
  const search = (
    q: string,
    limit = 8,
    type: "vaults" | "people" | "places" | "all" = "all",
    filters?: any
  ) => ({
    queryKey: [...searchKeys.query(q), type, filters, limit],
    queryFn: async (): Promise<SearchResult> => {
      let url = `/search?q=${encodeURIComponent(q)}&limit=${limit}&type=${type}`;
      
      // Append filters if they exist
      if (filters) {
        if (filters.sort && filters.sort !== "relevance") url += `&sort=${filters.sort}`;
        
        if (type === "vaults") {
          if (filters.mood) url += `&mood=${filters.mood}`;
          if (filters.timeframe) url += `&timeframe=${filters.timeframe}`;
        } else if (type === "people") {
          if (filters.minFollowers > 0) url += `&minFollowers=${filters.minFollowers}`;
          if (filters.followingOnly) url += `&followingOnly=true`;
          if (filters.tripType) url += `&tripType=${filters.tripType}`;
          if (filters.country) url += `&country=${filters.country}`;
        } else if (type === "places") {
          if (filters.minVaults > 0) url += `&minVaults=${filters.minVaults}`;
        }
      }

      const response = await axiosInstance.get<ApiResponse<SearchResult>>(url);
      return response.data.data;
    },
    enabled: q.trim().length >= 2,
    staleTime: 10 * 60 * 1000, // 10 min — consistent with global default
  });

  return { search };
};
