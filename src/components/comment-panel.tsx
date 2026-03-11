import { useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUser,
  faPaperPlane,
  faTrash,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import { useUserContext } from "../contexts/user/user";
import { vaultQueries } from "../tanstack/vault/queries";
import { vaultMutation } from "../tanstack/vault/mutation";
import type { VaultComment } from "../types/vault";
import { relativeTime } from "../utils/formatters";

interface CommentPanelProps {
  vaultId: string;
  /** If provided, the input field is shown */
  showInput?: boolean;
  /** Max comments shown (used in desktop inline mode with "see more" btn) */
  maxShown?: number;
  onSeeMore?: () => void;
  className?: string;
  /** Used in modal mode to track scroll container for infinite scroll */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  hideCountHeader?: boolean;
}

const CommentRow = ({
  comment,
  isOwn,
  onDelete,
}: {
  comment: VaultComment;
  isOwn: boolean;
  onDelete: (id: string) => void;
}) => {
  const initial =
    comment.author?.name?.charAt(0)?.toUpperCase() ??
    comment.author?.username?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-50 last:border-0 animate-[fadeInUp_0.18s_ease-out]">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 text-white text-xs font-bold ring-2 ring-white shadow-sm">
        {comment.author?.profilePicUrl ? (
          <img
            src={comment.author.profilePicUrl}
            alt={comment.author.name ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">
              {comment.author?.name ??
                comment.author?.username ??
                "Anonymous"}
            </span>
            <span className="text-[10px] text-gray-400">
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-300 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded-full hover:bg-rose-50"
              title="Delete comment"
            >
              <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  );
};

const CommentInput = ({
  onSubmit,
  isPending,
}: {
  vaultId: string;
  onSubmit: (text: string) => void;
  isPending: boolean;
}) => {
  const { user } = useUserContext();
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = textRef.current?.value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        if (textRef.current) {
          textRef.current.value = "";
          textRef.current.style.height = "auto";
        }
      }
    }
  };

  const handleClick = () => {
    const trimmed = textRef.current?.value.trim();
    if (trimmed) {
      onSubmit(trimmed);
      if (textRef.current) {
        textRef.current.value = "";
        textRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-start gap-3 bg-gray-50 rounded-2xl p-2 focus-within:bg-white transition-colors border border-gray-100">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs font-bold ring-2 ring-white ml-0.5 mt-0.5">
          {user?.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="text-[14px]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textRef}
            rows={1}
            onKeyDown={handleKey}
            placeholder="Write a comment…"
            className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 px-2 py-3 pr-12 focus:outline-none transition-all leading-relaxed"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleClick}
            disabled={isPending}
            className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPending ? (
              <FontAwesomeIcon icon={faSpinner} className="text-[14px] animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="text-[14px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentPanel = ({
  vaultId,
  showInput = true,
  maxShown,
  onSeeMore,
  className,
  scrollContainerRef,
  hideCountHeader = false,
}: CommentPanelProps) => {
  const { user, isLoggedIn } = useUserContext();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { getComments } = vaultQueries();
  const { postCommentMutation, deleteCommentMutation } = vaultMutation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(getComments(vaultId));

  const { mutate: postComment, isPending: isPosting } = useMutation(
    postCommentMutation(vaultId),
  );
  const { mutate: deleteComment } = useMutation(deleteCommentMutation(vaultId));

  // Flatten pages into a single list
  const allComments = data?.pages.flatMap((p: any) => (p?.data || []) as VaultComment[]) ?? [];
  const totalCount = (data?.pages[0] as any)?.total ?? 0;

  const visibleComments =
    maxShown !== undefined ? allComments.slice(0, maxShown) : allComments;

  // Infinite scroll using IntersectionObserver
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, {
      root: scrollContainerRef?.current ?? null,
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect, scrollContainerRef]);

  return (
    <div className={cn("", className)}>
      {/* Input */}
      {showInput && isLoggedIn && (
        <div className="px-4 md:px-5 pb-3 pt-3 border-b border-gray-100">
          <CommentInput
            vaultId={vaultId}
            onSubmit={(text) => postComment(text)}
            isPending={isPosting}
          />
        </div>
      )}

      {/* Count header */}
      {!hideCountHeader && (
        <div className="flex items-center gap-1.5 px-4 md:px-5 pt-3 pb-1">
          <FontAwesomeIcon icon={faComment} className="text-gray-300 text-xs" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {totalCount} {totalCount === 1 ? "comment" : "comments"}
          </span>
        </div>
      )}

      {/* List */}
      <div className="px-4 md:px-5 pb-10">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl" />
            <p className="text-xs">Loading comments…</p>
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon icon={faComment} className="text-gray-300 text-xl" />
            </div>
            <p className="text-sm text-gray-400 font-medium">
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                isOwn={!!user?.username && comment.author?.username === user.username}
                onDelete={(id) => deleteComment(id)}
              />
            ))}

            {/* Infinite scroll sentinel (only in full list mode) */}
            {maxShown === undefined && (
              <div ref={loadMoreRef} className="h-1" />
            )}

            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-gray-400"
                />
              </div>
            )}

            {/* "See more comments" button — desktop inline mode */}
            {maxShown !== undefined && allComments.length > maxShown && onSeeMore && (
              <button
                onClick={onSeeMore}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
              >
                <span>See all {totalCount} comments</span>
                <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentPanel;
