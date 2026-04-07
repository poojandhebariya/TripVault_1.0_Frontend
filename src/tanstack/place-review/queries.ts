import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axios-instance";
import { placeReviewKeys } from "./keys";

export interface PlaceReviewUser {
  id: string;
  name: string;
  username: string;
  profilePicUrl?: string;
}

export interface PlaceReviewData {
  id: string;
  placeId: string;
  rating: number;
  text: string;
  createdAt: string;
  upvotesCount: number;
  hasUpvoted: boolean;
  user: PlaceReviewUser;
}

export const useGetPlaceReviews = (placeId: string, sortBy: string) => {
  return useQuery({
    queryKey: placeReviewKeys.list(placeId, { sortBy }),
    queryFn: async () => {
      const response = await api.get(`/place-reviews/${placeId}`, {
        params: { sortBy },
      });
      const payload = response.data;
      if (payload && payload.data && Array.isArray(payload.data)) {
        return payload.data as PlaceReviewData[];
      }
      return (Array.isArray(payload) ? payload : []) as PlaceReviewData[];
    },
    enabled: !!placeId,
  });
};
