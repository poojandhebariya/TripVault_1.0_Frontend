import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faBookmark,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import {
  LIKE_PARTICLES,
  SAVE_PARTICLES,
  type Particle,
} from "./engagement-particles";
import "./vault-engagement-bar.css";
import useIsMobile from "../hooks/isMobile";

interface VaultEngagementBarProps {
  likesCount?: number;
  commentsCount?: number;
  isInitialLiked?: boolean;
  isInitialSaved?: boolean;
  onLike?: (liked: boolean) => void;
  onSave?: (saved: boolean) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  allowComments?: boolean;
  className?: string;
}

const HEART_CLIP_ID = "heart-clip";
const BOOKMARK_CLIP_ID = "bookmark-clip";

const VaultEngagementBar = ({
  likesCount: initialLikes = 0,
  commentsCount = 0,
  isInitialLiked = false,
  isInitialSaved = false,
  onLike,
  onSave,
  onCommentClick,
  onShareClick,
  allowComments = true,
  className,
}: VaultEngagementBarProps) => {
  const [liked, setLiked] = useState(isInitialLiked);
  const [saved, setSaved] = useState(isInitialSaved);
  const [likeBurst, setLikeBurst] = useState(false);
  const [saveBurst, setSaveBurst] = useState(false);
  const likeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const isMd = !isMobile;

  useEffect(() => {
    setLiked(isInitialLiked);
  }, [isInitialLiked]);

  useEffect(() => {
    setSaved(isInitialSaved);
  }, [isInitialSaved]);

  const triggerBurst = (
    setter: (v: boolean) => void,
    timeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  ) => {
    if (timeout.current) clearTimeout(timeout.current);
    setter(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setter(true);
        timeout.current = setTimeout(() => setter(false), 800);
      }),
    );
  };

  const handleAction = (isSaved: boolean) => {
    if (isSaved) {
      const newState = !saved;
      setSaved(newState);
      onSave?.(newState);
      if (newState) triggerBurst(setSaveBurst, saveTimeout);
    } else {
      const newState = !liked;
      setLiked(newState);
      onLike?.(newState);
      if (newState) triggerBurst(setLikeBurst, likeTimeout);
    }
  };

  const renderParticles = (particles: readonly Particle[], burst: boolean) =>
    burst &&
    particles.map((p, i) => (
      <span
        key={i}
        className="particle-fly pointer-events-none absolute rounded-full"
        style={{
          width: p.size,
          height: p.size,
          background: p.color,
          top: "50%",
          left: "50%",
          marginTop: -(p.size / 2),
          marginLeft: -(p.size / 2),
          zIndex: 20,
          animationDelay: `${p.delay}ms`,
          ["--tx" as any]: `${Math.cos((p.angle * Math.PI) / 180) * p.dist}px`,
          ["--ty" as any]: `${Math.sin((p.angle * Math.PI) / 180) * p.dist}px`,
        }}
      />
    ));

  const displayLikes =
    initialLikes +
    (liked && !isInitialLiked ? 1 : !liked && isInitialLiked ? -1 : 0);

  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id={HEART_CLIP_ID} clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.85 C0.5,0.85 0.05,0.55 0.05,0.3 C0.05,0.15 0.18,0.05 0.32,0.05 C0.4,0.05 0.47,0.09 0.5,0.15 C0.53,0.09 0.6,0.05 0.68,0.05 C0.82,0.05 0.95,0.15 0.95,0.3 C0.95,0.55 0.5,0.85 0.5,0.85 Z" />
          </clipPath>
          <clipPath id={BOOKMARK_CLIP_ID} clipPathUnits="objectBoundingBox">
            <path d="M0.18,0 L0.82,0 C0.91,0 1,0.08 1,0.18 L1,1 L0.5,0.72 L0,1 L0,0.18 C0,0.08 0.09,0 0.18,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className={cn("flex items-center gap-1", className)}>
        {/* Like Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(false);
          }}
          className={cn(
            "engagement-bar-btn",
            liked ? "text-rose-500" : "text-gray-500",
          )}
        >
          {likeBurst && (
            <span
              className="heart-glow-anim pointer-events-none absolute"
              style={{
                width: isMd ? 30 : 20,
                height: isMd ? 30 : 20,
                top: "50%",
                left: "50%",
                marginTop: isMd ? -15 : -10,
                marginLeft: isMd ? -20 : -16,
                background: "rgba(244,63,94,0.55)",
                clipPath: "url(#heart-clip)",
                zIndex: 0,
                transformOrigin: "center center",
              }}
            />
          )}
          {renderParticles(LIKE_PARTICLES, likeBurst)}
          <FontAwesomeIcon
            key={`like-${liked}-${likeBurst}`}
            icon={faHeart}
            className={cn(
              "text-lg md:text-2xl relative z-10",
              liked && likeBurst && "heart-pop",
            )}
          />
          <span className="engagement-bar-count">{displayLikes}</span>
        </button>

        {/* Comment Button */}
        {allowComments && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick?.();
            }}
            className="engagement-bar-btn text-gray-500 hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faComment} className="text-lg md:text-2xl" />
            <span className="engagement-bar-count">{commentsCount}</span>
          </button>
        )}

        {/* Share Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShareClick?.();
          }}
          className="engagement-bar-btn text-gray-500 hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faShare} className="text-lg md:text-2xl" />
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(true);
          }}
          className={cn(
            "ml-auto engagement-bar-btn justify-center w-8 h-8 px-0",
            saved ? "text-blue-600" : "text-gray-400",
          )}
        >
          {saveBurst && (
            <span
              className="bookmark-glow-anim pointer-events-none absolute"
              style={{
                width: isMd ? 20 : 14,
                height: isMd ? 26 : 18,
                top: "50%",
                left: "50%",
                marginTop: isMd ? -13 : -7,
                marginLeft: isMd ? -20 : -12,
                background: "rgba(59,130,246,0.55)",
                clipPath: "url(#bookmark-clip)",
                zIndex: 0,
                transformOrigin: "center center",
              }}
            />
          )}
          {renderParticles(SAVE_PARTICLES, saveBurst)}
          <FontAwesomeIcon
            key={`save-${saved}-${saveBurst}`}
            icon={faBookmark}
            className={cn(
              "text-lg md:text-2xl relative z-10 mr-3 md:mr-5",
              saved && saveBurst && "heart-pop",
            )}
          />
        </button>
      </div>
    </>
  );
};

export default VaultEngagementBar;
