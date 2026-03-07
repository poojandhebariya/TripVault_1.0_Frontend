import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faShare,
  faBookmark,
  faLocationDot,
  faUser,
  faChevronLeft,
  faChevronRight,
  faImage,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../pages/types/vault";
import VaultPostMenu from "./vault-post-menu";
import { useUserContext } from "../contexts/user/user";
import ImagePreviewModal from "./ui/image-preview-modal";
import VaultInsightsModal from "./ui/vault-insights-modal";
import { MOODS } from "../utils/moods";
import { useMutation } from "@tanstack/react-query";
import { vaultMutation } from "../tanstack/vault/mutation";
import { useSnackbar } from "react-snackify";
import type { AxiosError } from "axios";
import DeleteConfirmModal from "./ui/delete-confirm-modal";

interface VaultCardProps {
  vault: Vault;
  variant?: "mobile" | "desktop";
  trackImpression?: boolean;
}

/** Pretty-print a createdAt ISO string as relative time ("2h ago") */
const relativeTime = (iso?: string): string => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getMoodMeta = (mood: string | null) => {
  if (!mood) return null;
  return (
    MOODS.find(
      (m) =>
        m.id === mood.toLowerCase() ||
        m.label.toLowerCase() === mood.toLowerCase(),
    ) ?? null
  );
};

/** Format distance: < 1 km → "X m", >= 1km → "X.X km" */
const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

/** Open Google Maps at the given coordinates */
const openGoogleMaps = (lat: number, lon: number, label?: string) => {
  const query = label ? encodeURIComponent(label) : `${lat},${lon}`;
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}&center=${lat},${lon}`,
    "_blank",
    "noopener,noreferrer",
  );
};

const VaultCard = ({
  vault,
  variant = "desktop",
  trackImpression = false,
}: VaultCardProps) => {
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);

  const { user } = useUserContext();
  const { showSnackbar } = useSnackbar();
  const { incrementViewMutation, deleteVaultMutation } = vaultMutation();
  const { mutate: deleteVault, isPending: isDeleting } =
    useMutation(deleteVaultMutation);
  const { mutate: incrementView } = useMutation({
    ...incrementViewMutation,
    mutationKey: [...(incrementViewMutation.mutationKey as any[]), vault.id],
  });

  useEffect(() => {
    if (
      !trackImpression ||
      !cardRef.current ||
      hasTracked.current ||
      !vault.id ||
      isOwner
    )
      return;

    // Use a session-level global to ensure we only track this vault ID once per session
    if (!(window as any)._trackedVaultIds)
      (window as any)._trackedVaultIds = new Set();
    if ((window as any)._trackedVaultIds.has(vault.id)) {
      hasTracked.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!hasTracked.current) {
              incrementView(vault.id!);
              hasTracked.current = true;
              (window as any)._trackedVaultIds.add(vault.id);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [trackImpression, vault.id]);

  // Check if truncation is actually happening
  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (descRef.current) {
        const { scrollHeight, clientHeight } = descRef.current;
        setCanExpand(scrollHeight > clientHeight);
      }
    };

    checkTruncation();

    // Also observe resize just in case window size changes
    const observer = new ResizeObserver(checkTruncation);
    if (descRef.current) observer.observe(descRef.current);

    return () => observer.disconnect();
  }, [vault.description]);

  const images = vault.attachments.filter((a) => a.type === "image");
  const country = vault.location?.label
    ? vault.location.label.split(",").at(-1)?.trim()
    : null;

  const moodMeta = getMoodMeta(vault.mood);
  const timeAgo = relativeTime(vault.createdAt);

  // Is the logged-in user the owner of this vault?
  const isOwner = !!user?.username && user.username === vault.author?.username;
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!vault.id) return;
    deleteVault(vault.id, {
      onSuccess: () => {
        showSnackbar({
          message: "Vault deleted",
          variant: "success",
          classname: "text-white",
        });
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message: string }>;
        const msg =
          axiosErr?.response?.data?.message ?? "Failed to delete vault";
        showSnackbar({
          message: msg,
          variant: "error",
          classname: "text-white",
        });
      },
    });
  };

  const prevImg = () =>
    setActiveImg((p) => (p - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((p) => (p + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      dx > 0 ? nextImg() : prevImg();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const isMobile = variant === "mobile";

  const wrapper = isMobile
    ? "bg-white border-b border-gray-100"
    : "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300";

  const handleNavigateMap = () => {
    if (vault.location?.lat && vault.location?.lon) {
      openGoogleMaps(
        vault.location.lat,
        vault.location.lon,
        vault.location.label,
      );
    }
  };

  const likeCount = vault.likesCount ?? 0;
  const commentCount = vault.commentsCount ?? 0;

  return (
    <article ref={cardRef} className={wrapper}>
      {/* ── Author row ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
          {vault.author?.profilePicUrl && vault.author.profilePicUrl !== "" ? (
            <img
              src={vault.author.profilePicUrl}
              alt={vault.author.name ?? "Author"}
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
          )}
        </div>

        {/* Name + location + distance */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">
            {vault.author?.name ?? vault.author?.username ?? "Traveller"}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {country && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-rose-400 text-[10px] shrink-0"
                />
                <span className="truncate max-w-[120px]">{country}</span>
              </p>
            )}
            {timeAgo && (
              <span className="text-[10px] text-gray-400 shrink-0">
                · {timeAgo}
              </span>
            )}
            {/* Distance badge */}
            {typeof vault.distance === "number" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shrink-0">
                <FontAwesomeIcon icon={faRoute} className="text-[8px]" />
                {formatDistance(vault.distance)}
              </span>
            )}
          </div>
        </div>

        {/* ⋮ 3-dot menu */}
        <VaultPostMenu
          isOwner={isOwner}
          hasLocation={!!vault.location}
          isPinned={!!vault.isPinned}
          isPublished={vault.status === "publish"}
          onFollow={() => console.log("follow")}
          onReport={() => console.log("report")}
          onNavigateMap={handleNavigateMap}
          onNotInterested={() => console.log("not interested")}
          onEdit={() => navigate(`/vault/edit/${vault.id}`)}
          onDelete={() => setShowDeleteConfirm(true)}
          onPin={() => console.log("pin")}
          onViewInsights={() => setShowInsights(true)}
        />
      </div>

      {/* ── Insights Modal ── */}
      <VaultInsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        vault={vault}
      />

      {/* ── Image carousel ── */}
      {images.length > 0 && (
        <div
          className={`relative w-full overflow-hidden bg-gray-100 select-none ${
            isMobile ? "h-full" : "h-[400px]"
          }`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Sliding strip */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeImg * 100}%)` }}
          >
            {images.map((img, i) =>
              img.url ? (
                <img
                  key={i}
                  src={img.url}
                  alt={`${vault.title} photo ${i + 1}`}
                  className="w-full h-full object-cover shrink-0 cursor-zoom-in"
                  draggable={false}
                  onClick={() => setPreviewSrc(img.url)}
                />
              ) : (
                <div
                  key={i}
                  className="w-full h-full bg-gray-200 flex items-center justify-center shrink-0"
                >
                  <FontAwesomeIcon
                    icon={faImage}
                    className="text-gray-400 text-3xl"
                  />
                </div>
              ),
            )}
          </div>

          {/* Attachment count badge (top-right) */}
          {images.length > 1 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              <FontAwesomeIcon icon={faImage} className="text-[9px]" />
              {activeImg + 1}/{images.length}
            </div>
          )}

          {/* Mood badge (bottom-left, over image) */}
          {moodMeta && (
            <div
              className={`absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-linear-to-r ${moodMeta.bg} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xl`}
            >
              <span>{moodMeta.emoji}</span>
              <span>{moodMeta.label}</span>
            </div>
          )}

          {/* Prev/Next arrows — desktop only */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm items-center justify-center shadow-md text-gray-700 hover:bg-white hover:scale-105 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              <button
                onClick={nextImg}
                className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm items-center justify-center shadow-md text-gray-700 hover:bg-white hover:scale-105 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all duration-200 cursor-pointer ${
                    i === activeImg
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mood pill below image (when no image) */}
      {moodMeta && images.length === 0 && (
        <div className="px-4 pt-1">
          <span
            className={`inline-flex items-center gap-1.5 bg-linear-to-r ${moodMeta.bg} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm`}
          >
            {moodMeta.emoji} {moodMeta.label}
          </span>
        </div>
      )}

      {/* ── Engagement bar (below image, above title) ── */}
      <div className="flex items-center gap-0.5 pt-2.5 pb-0">
        {/* Like */}
        <button
          onClick={() => setLiked((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
            liked
              ? "bg-rose-50 text-rose-500"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`text-base md:text-lg cursor-pointer transition-transform duration-150 ${liked ? "scale-125" : ""}`}
          />
          <span className="text-xs">{likeCount > 0 ? likeCount : 0}</span>
        </button>

        {/* Comment */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer active:scale-95">
          <FontAwesomeIcon
            icon={faComment}
            className="text-base md:text-lg cursor-pointer"
          />
          <span className="text-xs">{commentCount > 0 ? commentCount : 0}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer active:scale-95">
          <FontAwesomeIcon
            icon={faShare}
            className="text-base md:text-lg cursor-pointer"
          />
        </button>

        {/* Save — pushed to right */}
        <button
          onClick={() => setSaved((p) => !p)}
          className={`ml-auto flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            saved
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:bg-gray-50"
          }`}
        >
          <FontAwesomeIcon
            icon={faBookmark}
            className="text-base md:text-lg cursor-pointer"
          />
        </button>
      </div>

      {/* ── Content: title → description → tags ── */}
      <div className="px-4 pt-2.5 pb-4 space-y-2">
        <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
          {vault.title}
        </h2>

        {vault.description && (
          <div className="relative text-sm text-gray-500 leading-relaxed">
            <div
              ref={descRef}
              className={`rich-editor-content selection:bg-blue-100 ${
                !isExpanded ? "line-clamp-2" : "inline"
              }`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(vault.description),
              }}
            />

            {canExpand && (
              <>
                {!isExpanded ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="absolute bottom-0.5 right-0 pl-10 pr-0 bg-linear-to-l from-white from-70% via-white/80 to-transparent text-xs font-bold text-blue-600 cursor-pointer pt-0.5"
                  >
                    more
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="inline-block ml-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    Show Less
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {vault.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {vault.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium cursor-pointer hover:bg-blue-100 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Preview modal ── */}
      <ImagePreviewModal
        src={previewSrc ?? undefined}
        isOpen={!!previewSrc}
        onClose={() => setPreviewSrc(null)}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        itemName={vault.title}
        itemType="vault"
        isLoading={isDeleting}
      />
    </article>
  );
};

export default VaultCard;
