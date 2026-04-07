import * as React from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { bucketListKeys } from "../../tanstack/bucket-list/keys";
import { useUserContext } from "../../contexts/user/user";
import { useGetPlaceReviews } from "../../tanstack/place-review/queries";
import useGeolocation from "../useGeolocation";
import { calculateDistance } from "../../utils/geo";
import { formatDistance } from "../../utils/formatters";
import type { Place } from "../../types/explore";
import { DUMMY_PLACE } from "../../data/explore/dummy";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const usePlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = React.useState<Place | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showBucketListModal, setShowBucketListModal] = React.useState(false);
  const [localSaved, setLocalSaved] = React.useState(false);

  const { isLoggedIn } = useUserContext();
  const queryClient = useQueryClient();
  const {
    location: userLocation,
    requestPermission,
    permissionState,
  } = useGeolocation();

  React.useEffect(() => {
    if (permissionState === "prompt" || permissionState === "granted") {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  const isSaved = React.useMemo(() => {
    if (localSaved) return true;
    if (!isLoggedIn || !id) return false;

    const cachedBucketList = queryClient.getQueriesData<any>({
      queryKey: bucketListKeys.all(),
    });
    let found = false;

    const checkArray = (arr: any[]) =>
      arr?.some?.((item: any) => item.placeId === id) ?? false;

    for (const [, cache] of cachedBucketList) {
      if (!cache) continue;
      if (cache.data && Array.isArray(cache.data)) {
        if (checkArray(cache.data)) found = true;
      } else if (Array.isArray(cache)) {
        if (checkArray(cache)) found = true;
      }
      if (found) break;
    }

    return found;
  }, [localSaved, isLoggedIn, id, queryClient]);

  const { data: reviews } = useGetPlaceReviews(id || "", "newest");

  const distanceText = React.useMemo(() => {
    if (userLocation && place?.lat && place?.lng) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng,
      );
      return `${formatDistance(dist)} away`;
    }
    return null;
  }, [userLocation, place]);

  const displayRating = React.useMemo(() => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0)
      return "0.0";
    return (
      reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const displayReviewCount = React.useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return 0;
    return reviews.length;
  }, [reviews]);

  React.useEffect(() => {
    const fetchPlace = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const cc = id.split("-")[0].toUpperCase();
        const r = await fetch(`/data/countries/${cc}.json`);
        if (r.ok) {
          const data = await r.json();
          const target = data.places.find((p: Place) => p.id === id);
          if (target) {
            setPlace({ ...target, country: data.name });
          } else {
            setPlace(DUMMY_PLACE);
          }
        } else setPlace(DUMMY_PLACE);
      } catch {
        setPlace(DUMMY_PLACE);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const p = place ?? DUMMY_PLACE;

  const handleShare = () => setShowShareModal(true);
  const handleCloseShare = () => setShowShareModal(false);
  const handleOpenBucketList = () => setShowBucketListModal(true);
  const handleCloseBucketList = () => setShowBucketListModal(false);
  const handleSetLocalSaved = () => setLocalSaved(true);

  return {
    id,
    p,
    loading,
    isSaved,
    distanceText,
    displayRating,
    displayReviewCount,
    showShareModal,
    showBucketListModal,
    handleShare,
    handleCloseShare,
    handleOpenBucketList,
    handleCloseBucketList,
    handleSetLocalSaved,
  };
};
