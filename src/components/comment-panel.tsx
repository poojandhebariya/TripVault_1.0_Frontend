import { useRef, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUser,
  faPaperPlane,
  faTrash,
  faSpinner,
  faChevronDown,
  faLock,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import { useUserContext } from "../contexts/user/user";
import { vaultQueries } from "../tanstack/vault/queries";
import { vaultMutation } from "../tanstack/vault/mutation";
import { userQueries } from "../tanstack/user/queries";
import type { VaultComment } from "../types/vault";
import { relativeTime } from "../utils/formatters";
import { useAuthGuard } from "../contexts/auth-guard-context";
import Input from "./ui/input";

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

const MENTION_REGEX = /(?:^|\s)@([a-zA-Z0-9_]*)$/;

const CommentInput = ({
  onSubmit,
  isPending,
  replyingTo,
  onCancelReply,
  variant = "default",
}: {
  vaultId: string;
  onSubmit: (text: string, parentId?: string) => void;
  isPending: boolean;
  replyingTo?: { id: string; username: string } | null;
  onCancelReply?: () => void;
  variant?: "default" | "minimal";
}) => {
  const isMinimal = variant === "minimal";
  const { user } = useUserContext();
  const textRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const [val, setVal] = useState("");
  const [mentionState, setMentionState] = useState<{
    query: string;
    startIndex: number;
    endIndex: number;
    selectedIndex: number;
  } | null>(null);

  const { searchUsers } = userQueries();
  const { data: searchResults, isFetching: isSearching } = useQuery({
    ...searchUsers(mentionState?.query ?? ""),
    enabled: !!mentionState && mentionState.query.length >= 1,
  });

  const handleInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setVal(e.target.value);

    // Auto-resize only for default textarea mode
    if (!isMinimal && e.target instanceof HTMLTextAreaElement) {
      const t = e.target;
      t.style.height = "auto";
      t.style.height = Math.min(t.scrollHeight, 120) + "px";
    }

    // Mention detection
    const cursor = e.target.selectionEnd ?? 0;
    const textBeforeCursor = e.target.value.slice(0, cursor);
    const match = MENTION_REGEX.exec(textBeforeCursor);

    if (match) {
      setMentionState((prev) => ({
        query: match[1],
        startIndex:
          match.index +
          (textBeforeCursor[match.index] === " " ||
          textBeforeCursor[match.index] === "\n"
            ? 1
            : 0),
        endIndex: cursor,
        selectedIndex: prev?.selectedIndex ?? 0,
      }));
    } else {
      setMentionState(null);
    }
  };

  const insertMention = (username: string) => {
    if (!mentionState || !textRef.current) return;

    const before = val.slice(0, mentionState.startIndex);
    const after = val.slice(mentionState.endIndex);

    const newText = before + "@" + username + " " + after;
    setVal(newText);
    setMentionState(null);
    textRef.current.focus();
  };

  useEffect(() => {
    if (replyingTo && textRef.current) {
      textRef.current.focus();
    }
  }, [replyingTo]);

  const handleKey = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (e.key === "Escape" && mentionState) {
      setMentionState(null);
      return;
    }

    if (mentionState && searchResults && searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionState((prev) =>
          prev
            ? {
                ...prev,
                selectedIndex: Math.min(
                  prev.selectedIndex + 1,
                  searchResults.length - 1,
                ),
              }
            : null,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionState((prev) =>
          prev
            ? { ...prev, selectedIndex: Math.max(prev.selectedIndex - 1, 0) }
            : null,
        );
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      if (mentionState && searchResults && searchResults.length > 0) {
        e.preventDefault();
        insertMention(searchResults[mentionState.selectedIndex].username);
        return;
      }

      const trimmed = val.trim();
      if (trimmed) {
        e.preventDefault();
        onSubmit(trimmed, replyingTo?.id);
        setVal("");
        onCancelReply?.();
        if (!isMinimal && textRef.current instanceof HTMLTextAreaElement) {
          textRef.current.style.height = "auto";
        }
      }
    }
  };

  const handleClick = () => {
    const trimmed = val.trim();
    if (trimmed) {
      onSubmit(trimmed, replyingTo?.id);
      setVal("");
      onCancelReply?.();
      if (!isMinimal && textRef.current instanceof HTMLTextAreaElement) {
        textRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className={cn("relative z-10 w-full", !isMinimal && "group")}>
      {!isMinimal && (
        <div className="absolute -inset-px bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {isMinimal ? (
        <div className="relative mt-3 mb-1 animate-[fadeIn_0.18s_ease-out]">
          <div className="relative [&_input]:pr-10 md:[&_input]:pr-22 [&_label]:hidden [&_div]:gap-0">
            <Input
              label=""
              ref={textRef as any}
              placeholder={`Reply to @${replyingTo?.username}...`}
              value={val}
              onChange={handleInput}
              onKeyDown={handleKey}
            />
            <button
              onClick={onCancelReply}
              className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white border border-gray-200"
              title="Cancel"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs md:text-sm" />
            </button>
            <div className="absolute right-1.5 top-0 bottom-0 flex items-center gap-1">
              <button
                onClick={handleClick}
                disabled={isPending || val.trim().length === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-700 text-white disabled:opacity-50 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                title="Post"
              >
                {isPending ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin text-xs"
                  />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col transition-colors border border-gray-100 xl:max-w-full bg-gray-50 rounded-2xl focus-within:bg-white",
          )}
        >
          {replyingTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 border-b border-blue-100 rounded-t-2xl animate-[fadeIn_0.2s_ease-out]">
              <span className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">
                Replying to @{replyingTo.username}
              </span>
              <button
                onClick={onCancelReply}
                className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-white/50 cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} className="text-[14px]" />
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 p-2 pb-[42px]">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-white border border-gray-200">
              {user?.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-600 text-[14px]"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                ref={textRef as any}
                rows={1}
                value={val}
                onChange={handleInput as any}
                onKeyDown={handleKey as any}
                onClick={handleInput as any}
                onKeyUp={handleInput as any}
                placeholder="Write a comment…"
                className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 px-2 py-2 focus:outline-none transition-all leading-relaxed"
                style={{ minHeight: "24px", maxHeight: "120px" }}
              />
            </div>
          </div>

          <div className="absolute right-2 bottom-2">
            <button
              onClick={handleClick}
              disabled={isPending || val.trim().length === 0}
              className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPending ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-[14px] animate-spin"
                />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="text-[14px]" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mention Dropdown */}
      {mentionState && mentionState.query.length >= 1 && (
        <div className="absolute bottom-full left-0 w-[240px] mb-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden text-left z-50">
          {isSearching ? (
            <div className="p-3 py-4 text-center text-xs text-gray-400">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Searching users...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto w-full flex flex-col">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 sticky top-0 border-b border-gray-100 z-10 w-full text-left">
                Press Enter to select
              </div>
              {searchResults.map((su, idx) => (
                <button
                  key={su.id}
                  onClick={() => insertMention(su.username)}
                  onMouseEnter={() =>
                    setMentionState((prev) =>
                      prev ? { ...prev, selectedIndex: idx } : null,
                    )
                  }
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer",
                    mentionState.selectedIndex === idx ? "bg-blue-50/60" : "",
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {su.profilePicUrl ? (
                      <img
                        src={su.profilePicUrl}
                        alt={su.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-400 text-xs mt-2 text-center w-full"
                      />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">
                      {su.name || su.username}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      @{su.username}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-gray-400">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentRow = ({
  comment,
  isOwn,
  onDelete,
  onReply,
  currentUserId,
  replyingTo,
  onCancelReply,
  onSubmitComment,
  isPosting,
  vaultId,
}: {
  comment: VaultComment;
  isOwn: boolean;
  onDelete: (id: string) => void;
  onReply?: (id: string, username: string) => void;
  currentUserId?: string;
  replyingTo?: { id: string; username: string } | null;
  onCancelReply?: () => void;
  onSubmitComment?: (text: string, parentId?: string) => void;
  isPosting?: boolean;
  vaultId?: string;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const numReplies = comment.replies?.length ?? 0;

  return (
    <div className="flex flex-col py-3.5 border-b border-gray-50 last:border-0 animate-[fadeInUp_0.18s_ease-out]">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm border border-gray-200">
          {comment.author?.profilePicUrl ? (
            <img
              src={comment.author.profilePicUrl}
              alt={comment.author.name ?? ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
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
          <p className="text-sm text-gray-600 leading-relaxed">
            {comment.text}
          </p>
          {onReply && (
            <button
              onClick={() =>
                onReply(comment.id, comment.author?.username ?? "user")
              }
              className="text-xs font-bold text-gray-400 hover:text-blue-500 mt-1.5 cursor-pointer transition-colors"
            >
              Reply
            </button>
          )}

          {/* Inline Reply Input */}
          {replyingTo?.id === comment.id &&
            onSubmitComment &&
            vaultId !== undefined && (
              <div className="mt-4">
                <CommentInput
                  vaultId={vaultId}
                  onSubmit={onSubmitComment}
                  isPending={isPosting ?? false}
                  replyingTo={replyingTo}
                  onCancelReply={onCancelReply}
                  variant="minimal"
                />
              </div>
            )}
        </div>
      </div>

      {numReplies > 0 && (
        <div className="ml-12 mt-1 flex flex-col pl-1">
          {!showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-3 transition-colors group w-fit py-1.5"
            >
              <span className="w-8 h-[2px] rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors"></span>
              View {numReplies} {numReplies === 1 ? "reply" : "replies"}
            </button>
          ) : (
            <div className="flex flex-col border-l-2 border-gray-100 pl-4 py-2 mt-1 animate-[fadeIn_0.2s_ease-out]">
              {comment.replies!.map((reply) => (
                <div key={reply.id} className="py-2.5 last:pb-0">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm border border-gray-200 mt-0.5">
                      {reply.author?.profilePicUrl ? (
                        <img
                          src={reply.author.profilePicUrl}
                          alt={reply.author.name ?? ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-600 text-[10px]"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-bold text-gray-900">
                            {reply.author?.name ??
                              reply.author?.username ??
                              "Anonymous"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {relativeTime(reply.createdAt)}
                          </span>
                        </div>
                        {reply.author?.id === currentUserId && (
                          <button
                            onClick={() => onDelete(reply.id)}
                            className="text-gray-300 hover:text-rose-400 transition-colors cursor-pointer p-1"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-[10px]"
                            />
                          </button>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">
                        {reply.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowReplies(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 self-start mt-3 mb-1 transition-colors"
              >
                Hide replies
              </button>
            </div>
          )}
        </div>
      )}
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
  const { guard } = useAuthGuard();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { getComments } = vaultQueries();
  const { postCommentMutation, deleteCommentMutation } = vaultMutation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(getComments(vaultId));

  const { mutate: postComment, isPending: isPosting } = useMutation(
    postCommentMutation(vaultId),
  );
  const { mutate: deleteComment } = useMutation(deleteCommentMutation(vaultId));

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // Flatten pages into a single list
  const allComments =
    data?.pages.flatMap((p: any) => (p?.data || []) as VaultComment[]) ?? [];
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
      {showInput && (
        <div className="px-4 md:px-5 pb-3 pt-3 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          {isLoggedIn ? (
            <CommentInput
              vaultId={vaultId}
              onSubmit={(text, parentId) => postComment({ text, parentId })}
              isPending={isPosting}
            />
          ) : (
            <button
              onClick={() => guard(() => {}, "comment on a vault")}
              className="w-full flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 ml-0.5">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-400 text-sm"
                />
              </div>
              <span className="flex-1 text-sm text-gray-400 text-left px-2">
                Login to join the conversation…
              </span>
              <div className="w-9 h-9 rounded-xl bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center mr-1 transition-colors">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-gray-400 group-hover:text-blue-500 text-xs transition-colors"
                />
              </div>
            </button>
          )}
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
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-xl"
            />
            <p className="text-xs">Loading comments…</p>
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faComment}
                className="text-gray-300 text-xl"
              />
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
                currentUserId={user?.id}
                isOwn={
                  !!user?.username && comment.author?.username === user.username
                }
                onDelete={(id) => deleteComment(id)}
                onReply={(id, username) =>
                  guard(
                    () => setReplyingTo({ id, username }),
                    "reply to a comment",
                  )
                }
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onSubmitComment={(text, parentId) =>
                  postComment({ text, parentId })
                }
                isPosting={isPosting}
                vaultId={vaultId}
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
            {maxShown !== undefined &&
              allComments.length > maxShown &&
              onSeeMore && (
                <button
                  onClick={onSeeMore}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                >
                  <span>See all {totalCount} comments</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-[10px]"
                  />
                </button>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentPanel;
