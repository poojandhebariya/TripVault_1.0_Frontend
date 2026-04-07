import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faPaperPlane, faThumbsUp, faSort, faChevronDown, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPlaceReviews } from "../../tanstack/place-review/queries";
import { useAddPlaceReview, useUpvotePlaceReview } from "../../tanstack/place-review/mutations";
import { useAuthGuard } from "../../contexts/auth-guard-context";
import { timeAgo } from "../../utils/formatters";
import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import { REVIEW_GRADIENTS, REVIEW_SORT_OPTIONS } from "../../data/explore/constants";

import { type Place } from "../../types/explore";
const GRADIENTS = REVIEW_GRADIENTS;

// ─── Component ─────────────────────────────────────────────────────────────────

export const PlaceDetailReviews = ({ place }: { place: Place }) => {
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<"newest" | "highest" | "lowest" | "helpful">("newest");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const { guard } = useAuthGuard();
  const { data: reviews = [], isLoading } = useGetPlaceReviews(place?.id || "", sortBy);
  const addReviewMutation = useAddPlaceReview(place?.id || "");
  const upvoteMutation = useUpvotePlaceReview();

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const totalReviews = safeReviews.length;
  const averageRating = totalReviews > 0
    ? (safeReviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const displayReviewCount = totalReviews;

  const getRatingStats = () => {
    if (totalReviews === 0) {
      return [
        { label: "Excellent", pct: 0, color: "bg-amber-400" },
        { label: "Good", pct: 0, color: "bg-amber-300" },
        { label: "Average", pct: 0, color: "bg-gray-300" },
        { label: "Poor", pct: 0, color: "bg-red-300" },
      ];
    }
    const count5 = safeReviews.filter((r: any) => r.rating === 5).length;
    const count4 = safeReviews.filter((r: any) => r.rating === 4).length;
    const count3 = safeReviews.filter((r: any) => r.rating === 3).length;
    const count21 = safeReviews.filter((r: any) => r.rating <= 2).length;

    return [
      { label: "Excellent", pct: Math.round((count5 / totalReviews) * 100), color: "bg-amber-400" },
      { label: "Good", pct: Math.round((count4 / totalReviews) * 100), color: "bg-amber-300" },
      { label: "Average", pct: Math.round((count3 / totalReviews) * 100), color: "bg-gray-300" },
      { label: "Poor", pct: Math.round((count21 / totalReviews) * 100), color: "bg-red-300" },
    ];
  };

  const ratingStats = getRatingStats();

  const handlePublish = () => {
    guard(() => {
      if (!reviewText.trim() || !place?.id) return;
      addReviewMutation.mutate(
        { rating: reviewRating, text: reviewText },
        {
          onSuccess: () => {
            setReviewText("");
            setReviewRating(5);
          },
        }
      );
    }, "write a review");
  };

  const handleUpvote = (reviewId: string) => {
    guard(() => {
      upvoteMutation.mutate(reviewId);
    }, "upvote this review");
  };

      {/* Sort logic updated to use centralized constant */}

  return (
    <div className="space-y-8">
      {/* Rating hero */}
      <div className="bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center justify-center gap-2 md:pr-6 md:border-r md:border-amber-100">
          <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none">
            {averageRating}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <FontAwesomeIcon
                key={s}
                icon={faStar}
                className={
                  s <= Math.round(Number(averageRating)) ? "text-amber-400" : "text-gray-200"
                }
                style={{ fontSize: 12 }}
              />
            ))}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
            {displayReviewCount.toLocaleString()} reviews
          </p>
        </div>
        <div className="flex-1 space-y-2.5 justify-center flex flex-col">
          {ratingStats.map((bar) => (
            <div key={bar.label} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-500 w-14 shrink-0">
                {bar.label}
              </span>
              <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${bar.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 w-8 text-right">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
            <FontAwesomeIcon icon={faUser} className="text-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">
              Write a Review
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Share your experience with the community
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setReviewRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="cursor-pointer transition-transform hover:scale-125"
            >
              <FontAwesomeIcon
                icon={faStar}
                className={
                  (hoverRating || reviewRating) >= s
                    ? "text-amber-400"
                    : "text-gray-200"
                }
                style={{ fontSize: 18 }}
              />
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-1 font-semibold">
            {reviewRating}.0 out of 5
          </span>
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="How was your experience here…"
          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm min-h-[100px] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/80 transition-all resize-none placeholder:text-gray-300 mb-4"
        />
        <button 
          onClick={handlePublish}
          disabled={addReviewMutation.isPending || !reviewText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {addReviewMutation.isPending ? (
            <FontAwesomeIcon icon={faCircleNotch} className="text-[10px] animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
          )}
          Publish Review
        </button>
      </div>

      {/* Review list Header & Filters */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Community Reviews <span className="text-gray-400 text-sm font-normal ml-2">({reviews.length})</span>
        </h3>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faSort} className="text-gray-400" />
            {REVIEW_SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-gray-400 ml-1" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 dropdown-content"
              >
                {REVIEW_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value as any);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold cursor-pointer transition ${
                      sortBy === opt.value
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Review list */}
      <div className="min-h-[200px] flex flex-col pt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <FontAwesomeIcon icon={faCircleNotch} className="text-indigo-500 animate-spin text-2xl" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <p className="text-sm font-semibold text-gray-400">No reviews yet.</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          safeReviews.map((rev: any, i: number) => {
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const initial = rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "?";

            return (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="py-5 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Link to={ROUTES.USER.PUBLIC_PROFILE_PATH(rev.user?.id || "")} className="shrink-0 transition-transform hover:scale-105 active:scale-95">
                      {rev.user?.profilePicUrl ? (
                        <img 
                          src={rev.user.profilePicUrl}
                          alt={rev.user.name}
                          className="w-9 h-9 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                        >
                          {initial}
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link to={ROUTES.USER.PUBLIC_PROFILE_PATH(rev.user?.id || "")} className="group">
                        <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">
                          {rev.user?.name || "Anonymous User"}
                        </p>
                      </Link>
                      <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(rev.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <FontAwesomeIcon
                         key={idx}
                        icon={faStar}
                        className="text-amber-400"
                        style={{ fontSize: 10 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{rev.text}</p>
                <button 
                  onClick={() => handleUpvote(rev.id)}
                  disabled={upvoteMutation.isPending}
                  className={`flex items-center gap-1.5 mt-3 text-[10px] font-bold transition cursor-pointer ${
                    rev.hasUpvoted ? "text-indigo-600" : "text-gray-400 border border-transparent hover:text-indigo-500"
                  }`}
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="text-[9px]" />{" "}
                  {rev.upvotesCount} helpful
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
