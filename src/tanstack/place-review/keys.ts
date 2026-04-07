export const placeReviewKeys = {
  all: ["place-reviews"] as const,
  lists: () => [...placeReviewKeys.all, "list"] as const,
  list: (placeId: string, filters: { sortBy: string }) => [...placeReviewKeys.lists(), placeId, filters] as const,
};
