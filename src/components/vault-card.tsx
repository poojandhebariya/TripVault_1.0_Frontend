import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { cn } from "../lib/cn-merge";
import type { Vault } from "../types/vault";
import VaultPostMenu from "./vault-post-menu";
import { useUserContext } from "../contexts/user/user";
import VaultInsightsModal from "./ui/vault-insights-modal";
import { MOODS } from "../utils/moods";
import { useMutation } from "@tanstack/react-query";
import { vaultMutation } from "../tanstack/vault/mutation";
import DeleteConfirmModal from "./ui/delete-confirm-modal";
import VaultAuthorHeader from "./vault-author-header";
import VaultMediaCarousel from "./vault-media-carousel";
import VaultEngagementBar from "./vault-engagement-bar";
import CommentPanel from "./comment-panel";
import Modal from "./ui/modal";
import ShareModal from "./ui/share-modal";
import { getVaultShareUrl, ROUTES } from "../utils/constants";
import BucketListModal from "./ui/bucket-list-modal";
import ReportModal from "./ui/report-modal";
import { userMutation } from "../tanstack/user/mutation";
import { useAuthGuard } from "../contexts/auth-guard-context";

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

  const [showInsights, setShowInsights] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showBucketListModal, setShowBucketListModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useUserContext();
  const { guard } = useAuthGuard();
  const {
    incrementViewMutation,
    deleteVaultMutation,
    likeVaultMutation,
    unlikeVaultMutation,
    saveVaultMutation,
    unsaveVaultMutation,
    notInterestedMutation,
    reportVaultMutation,
  } = vaultMutation();
  const { mutate: deleteVault, isPending: isDeleting } =
    useMutation(deleteVaultMutation);
  const { mutate: likeVault } = useMutation(likeVaultMutation);
  const { mutate: unlikeVault } = useMutation(unlikeVaultMutation);
  const { mutate: saveVault } = useMutation(saveVaultMutation);
  const { mutate: unsaveVault } = useMutation(unsaveVaultMutation);
  const { mutate: notInterested } = useMutation(notInterestedMutation);
  const { mutate: reportVault, isPending: isReporting } =
    useMutation(reportVaultMutation);
  const { mutate: incrementView } = useMutation({
    ...incrementViewMutation,
    mutationKey: [...(incrementViewMutation.mutationKey as any[]), vault.id],
  });

  const { followMutation, unfollowMutation } = userMutation();
  const authorId = vault.author?.id;
  const isFollowing = !!vault.author?.isFollowing;
  const requestPending = !!vault.author?.requestPending;

  const followMut = useMutation(followMutation(authorId ?? ""));
  const unfollowMut = useMutation(unfollowMutation(authorId ?? ""));

  const handleFollow = () => {
    if (!authorId || isOwner) return;
    guard(() => {
      if (isFollowing || requestPending) {
        unfollowMut.mutate(authorId);
      } else {
        followMut.mutate(authorId);
      }
    }, isFollowing ? "unfollow this traveller" : requestPending ? "cancel this follow request" : "follow this traveller");
  };

  // Is the logged-in user the owner of this vault?
  const isOwner = !!currentUser?.username && currentUser.username === vault.author?.username;

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
    if (vault.id) deleteVault(vault.id);
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
    <>
      <article ref={cardRef} className={wrapper}>
        {/* ── Author row ── */}
        <VaultAuthorHeader
          vault={vault}
          className="px-4 pt-4 pb-3"
          onAvatarClick={() => {
            if (vault.author?.id) {
              navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(vault.author.id));
            }
          }}
          onNameClick={() => {
            if (vault.author?.id) {
              navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(vault.author.id));
            }
          }}
          rightElement={
            <VaultPostMenu
              isOwner={isOwner}
              isFollowing={isFollowing}
              requestPending={requestPending}
              hasLocation={!!vault.location}
              isPinned={!!vault.isPinned}
              isPublished={vault.status === "publish"}
              isBucketListed={vault.isBucketListed}
              onFollow={handleFollow}
              onReport={() =>
                guard(
                  () => setShowReport(true),
                  "report this post",
                )
              }
              onNavigateMap={handleNavigateMap}
              onNotInterested={() => guard(() => { if (vault.id) notInterested(vault.id) }, "hide this post")}
              onEdit={() => navigate(`/vault/edit/${vault.id}`)}
              onDelete={() => setShowDeleteConfirm(true)}
              onPin={() => console.log("pin")}
              onViewInsights={() => setShowInsights(true)}
              onAddToBucketList={() =>
                guard(
                  () => setShowBucketListModal(true),
                  "add a vault to your bucket list",
                )
              }
            />
          }
        />

        {/* ── Insights Modal ── */}
        <VaultInsightsModal
          isOpen={showInsights}
          onClose={() => setShowInsights(false)}
          vault={vault}
        />

        {vault.id && (
          <BucketListModal
            isOpen={showBucketListModal}
            onClose={() => setShowBucketListModal(false)}
            vaultId={vault.id}
          />
        )}

        {/* ── Report Modal ── */}
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          isLoading={isReporting}
          onSubmit={(reason, comment) => {
            if (!vault.id) return;
            reportVault(
              { vaultId: vault.id, reason, comment },
              { onSuccess: () => setShowReport(false) },
            );
          }}
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
          isInitialSaved={vault.isSaved}
          onLike={(liked) => {
            return guard(() => {
              if (liked && vault.id) likeVault(vault.id);
              else if (!liked && vault.id) unlikeVault(vault.id);
            }, "like a vault");
          }}
          onSave={(saved) => {
            return guard(() => {
              if (saved && vault.id) saveVault(vault.id);
              else if (!saved && vault.id) unsaveVault(vault.id);
            }, "save a vault");
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



        {/* ── Desktop Inline Comments ── */}
        {!isMobile && showComments && vault.id && (
          <div className="border-t border-gray-100 bg-gray-50/50 mt-1 pb-1 animate-[fadeIn_0.2s_ease-out]">
            <CommentPanel
              vaultId={vault.id}
              maxShown={5}
              onSeeMore={() => navigate(`/vault/${vault.id}?tab=comments`)}
              hideCountHeader={true}
              showInput={true}
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
              showInput={true}
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
            type="vault"
          />
        )}
      </article>
    </>
  );
};

export default VaultCard;
