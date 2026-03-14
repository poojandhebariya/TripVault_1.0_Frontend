import axiosInstance from "../../utils/axios-instance";

import type { BucketListDto, BucketListStats } from "../../types/bucket-list";
import { bucketListKeys } from "./keys";

interface PagedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export const bucketListQueries = () => {
  return {
    getBucketList: (page: number, sortBy: string = "createdAt", sortDir: string = "desc") => ({
      queryKey: bucketListKeys.list(page, sortBy, sortDir),
      queryFn: async () => {
        const { data } = await axiosInstance.get<{
          success: boolean;
          message: string;
          data: PagedResponse<BucketListDto>;
        }>(`/bucket-list?page=${page}&limit=10&sortBy=${sortBy}&sortDir=${sortDir}`);
        return data.data;
      },
    }),

    getStats: () => ({
      queryKey: bucketListKeys.stats(),
      queryFn: async () => {
        const { data } = await axiosInstance.get<{
          success: boolean;
          message: string;
          data: BucketListStats;
        }>("/bucket-list/stats");
        return data.data;
      },
    }),
  };
};
