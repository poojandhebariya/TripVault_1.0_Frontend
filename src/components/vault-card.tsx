import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { cn } from "../lib/cn-merge";
import type { Vault } from "../types/vault";
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
import VaultAuthorHeader from "./vault-author-header";
import VaultMediaCarousel from "./vault-media-carousel";
import VaultEngagementBar from "./vault-engagement-bar";
import CommentPanel from "./comment-panel";
import Modal from "./ui/modal";
import ShareModal from "./ui/share-modal";
import { getVaultShareUrl } from "../utils/constants";

interface VaultCardProps {
  vault: Vault;
  variant?: "mobile" | "desktop";
  trackImpression?: boolean;
}

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
  const cardRef = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const { user } = useUserContext();
  const { showSnackbar } = useSnackbar();
  const {
    incrementViewMutation,
    deleteVaultMutation,
    likeVaultMutation,
    unlikeVaultMutation,
  } = vaultMutation();
  const { mutate: deleteVault, isPending: isDeleting } =
    useMutation(deleteVaultMutation);
  const { mutate: likeVault } = useMutation(likeVaultMutation);
  const { mutate: unlikeVault } = useMutation(unlikeVaultMutation);
  const { mutate: incrementView } = useMutation({
    ...incrementViewMutation,
    mutationKey: [...(incrementViewMutation.mutationKey as any[]), vault.id],
  });

  // Is the logged-in user the owner of this vault?
  const isOwner = !!user?.username && user.username === vault.author?.username;

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

  const mood =
    MOODS.find(
      (m) =>
        m.id === vault.mood?.toLowerCase() ||
        m.label.toLowerCase() === vault.mood?.toLowerCase(),
    ) ?? null;

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

  return (
    <article ref={cardRef} className={wrapper}>
      {/* ── Author row ── */}
      <VaultAuthorHeader
        vault={vault}
        className="px-4 pt-4 pb-3"
        rightElement={
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
        }
      />

      {/* ── Insights Modal ── */}
      <VaultInsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        vault={vault}
      />

      {/* ── Media Carousel ── */}
      <VaultMediaCarousel
        media={vault.attachments}
        aspectRatio={isMobile ? "4/3" : "auto"}
        maxHeight={isMobile ? "auto" : "400px"}
        className={cn(isMobile ? "" : "h-[400px]")}
        showCounter={images.length > 1}
        overlayElement={
          <>
            {/* Mood badge (bottom-left, over image) */}
            {mood && images.length > 0 && (
              <div
                className={`absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-linear-to-r ${mood.bg} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xl`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </div>
            )}
          </>
        }
      />

      {/* Mood pill below image (when no image) */}
      {mood && images.length === 0 && (
        <div className="px-4 pt-1">
          <span
            className={`inline-flex items-center gap-1.5 bg-linear-to-r ${mood.bg} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm`}
          >
            {mood.emoji} {mood.label}
          </span>
        </div>
      )}

      {/* ── Engagement Bar ── */}
      <VaultEngagementBar
        likesCount={vault.likesCount}
        commentsCount={vault.commentsCount}
        isInitialLiked={vault.isLiked}
        onLike={(liked) => {
          if (liked && vault.id) likeVault(vault.id);
          else if (!liked && vault.id) unlikeVault(vault.id);
        }}
        allowComments={vault.allowComments}
        className="pt-2.5 pb-0"
        onCommentClick={() => setShowComments((prev) => !prev)}
        onShareClick={() => setShowShare(true)}
      />

      {/* ── Content: title → description → tags ── */}
      <div className="px-4 pt-2.5 pb-4 space-y-2">
        <h2
          onClick={() => vault.id && navigate(`/vault/${vault.id}`)}
          className="text-base font-bold text-gray-900 leading-snug line-clamp-2 cursor-pointer hover:text-blue-700 transition-colors duration-150"
        >
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

      {/* ── Desktop Inline Comments ── */}
      {!isMobile && showComments && vault.id && (
        <div className="border-t border-gray-100 bg-gray-50/50 mt-1 pb-1 animate-[fadeIn_0.2s_ease-out]">
          <CommentPanel
            vaultId={vault.id}
            maxShown={5}
            onSeeMore={() => navigate(`/vault/${vault.id}?tab=comments`)}
            hideCountHeader={true}
          />
        </div>
      )}

      {/* ── Mobile Bottom Modal Comments ── */}
      {isMobile && vault.id && (
        <Modal
          open={showComments}
          onClose={() => setShowComments(false)}
          title={`${vault.commentsCount || 0} Comments`}
          variant="bottom"
          className="h-[85vh] rounded-t-3xl"
          bodyClassName="p-0 flex flex-col"
          bodyRef={scrollRef}
        >
          <CommentPanel
            vaultId={vault.id}
            scrollContainerRef={scrollRef}
            hideCountHeader={true}
          />
        </Modal>
      )}

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

      {/* ── Share Modal ── */}
      {vault.id && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          url={getVaultShareUrl(vault.id)}
          title={vault.title}
          description={vault.description}
        />
      )}
    </article>
  );
};

export default VaultCard;
