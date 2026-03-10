import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faBookmark,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";

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

const VaultEngagementBar = ({
  likesCount: initialLikes = 0,
  commentsCount: initialComments = 0,
  isInitialLiked = false,
  isInitialSaved = false,
  onLike,
  onSave,
  onCommentClick,
  onShareClick,
  allowComments = true,
  className,
}: VaultEngagementBarProps) => {
  const likesCount = initialLikes ?? 0;
  const commentsCount = initialComments ?? 0;
  const [liked, setLiked] = useState(isInitialLiked);
  const [saved, setSaved] = useState(isInitialSaved);

  const handleLike = () => {
    const newState = !liked;
    setLiked(newState);
    onLike?.(newState);
  };

  const handleSave = () => {
    const newState = !saved;
    setSaved(newState);
    onSave?.(newState);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Like */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95 shrink-0",
          liked ? "bg-rose-50 text-rose-500" : "text-gray-500 hover:bg-gray-50",
        )}
      >
        <FontAwesomeIcon
          icon={faHeart}
          className={cn(
            "text-base md:text-lg cursor-pointer transition-transform duration-150",
            liked && "scale-125",
          )}
        />
        <span className="text-xs font-semibold tabular-nums">
          {likesCount +
            (liked && !isInitialLiked ? 1 : !liked && isInitialLiked ? -1 : 0)}
        </span>
      </button>

      {/* Comment (Hidden if allowComments is false and count is 0, otherwise maybe user wants to see it) */}
      {allowComments !== false && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick?.();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
        >
          <FontAwesomeIcon
            icon={faComment}
            className="text-base md:text-lg cursor-pointer"
          />
          <span className="text-xs font-semibold tabular-nums">
            {commentsCount}
          </span>
        </button>
      )}

      {/* Share */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onShareClick?.();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
      >
        <FontAwesomeIcon
          icon={faShare}
          className="text-base md:text-lg cursor-pointer"
        />
      </button>

      {/* Save — pushed to right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSave();
        }}
        className={cn(
          "ml-auto flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shrink-0",
          saved ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50",
        )}
      >
        <FontAwesomeIcon
          icon={faBookmark}
          className="text-base md:text-lg cursor-pointer"
        />
      </button>
    </div>
  );
};

export default VaultEngagementBar;
