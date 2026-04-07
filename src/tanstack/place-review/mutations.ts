import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/axios-instance";
import { placeReviewKeys } from "./keys";
import type { PlaceReviewData } from "./queries";

export const useAddPlaceReview = (placeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rating: number; text: string }) => {
      const response = await api.post(`/place-reviews/${placeId}`, data);
      const payload = response.data as any;
      if (payload && payload.data) return payload.data as PlaceReviewData;
      return payload as PlaceReviewData;
    },
    onMutate: async (newReview) => {
      const fuzzyKey = [...placeReviewKeys.lists(), placeId];
      await queryClient.cancelQueries({ queryKey: fuzzyKey });
      const previousReviews = queryClient.getQueriesData<PlaceReviewData[]>({ queryKey: fuzzyKey });
      
      const tempId = `temp-${Date.now()}`;
      const optimisticReview: PlaceReviewData = {
        id: tempId,
        placeId,
        rating: newReview.rating,
        text: newReview.text,
        createdAt: new Date().toISOString(),
        upvotesCount: 0,
        hasUpvoted: false,
        user: {
          id: "temp",
          name: "You",
          username: "you",
        }
      };

      queryClient.setQueriesData({ queryKey: fuzzyKey }, (old: any) => {
        if (!old || !Array.isArray(old)) return [optimisticReview];
        return [optimisticReview, ...old];
      });

      return { previousReviews, tempId, fuzzyKey };
    },
    onError: (_err, _newReview, context) => {
      if (context?.previousReviews) {
        context.previousReviews.forEach(([queryKey, data]) => {
           if (data) queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, _variables, context) => {
      if (context?.fuzzyKey) {
        queryClient.setQueriesData({ queryKey: context.fuzzyKey }, (old: any) => {
          if (!old || !Array.isArray(old)) return [data];
          return old.map((rev: any) => rev.id === context.tempId ? data : rev);
        });
      }
    },
  });
};

export const useUpvotePlaceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await api.post(`/place-reviews/${reviewId}/upvote`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeReviewKeys.all });
    },
  });
};
