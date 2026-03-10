import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faHeart,
  faUser,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../../lib/cn-merge";
import { useUserContext } from "../../../contexts/user/user";

interface MockComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timeAgo: string;
  likes: number;
  initials: string;
  color: string;
}

const CommentRow = ({ comment }: { comment: MockComment }) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-50 last:border-0 animate-[slideTop_0.18s_ease-out]">
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm bg-linear-to-br",
          comment.color,
        )}
      >
        {comment.avatar ? (
          <img
            src={comment.avatar}
            alt={comment.author}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          comment.initials
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-bold text-gray-900">
            {comment.author}
          </span>
          <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
        <button
          onClick={() => setLiked((p) => !p)}
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer",
            liked ? "text-rose-500" : "text-gray-400 hover:text-rose-400",
          )}
        >
          <FontAwesomeIcon icon={faHeart} className="text-[10px]" />
          {comment.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  );
};

const CommentsTab = () => {
  const { user } = useUserContext();
  const [comments, setComments] = useState<MockComment[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setComments((p) => [
      {
        id: `local-${Date.now()}`,
        author: "You",
        text: trimmed,
        timeAgo: "just now",
        likes: 0,
        initials: "YO",
        color: "from-blue-500 to-indigo-500",
      },
      ...p,
    ]);
    setText("");
    inputRef.current?.blur();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="animate-[slideTop_0.2s_ease-out]">
      {/* Add comment wrapper with gradient border effect */}
      <div className="px-4 md:px-5 py-5 border-b border-gray-100 bg-white">
        <div className="relative group">
          {/* Decorative gradient border focus effect */}
          <div className="absolute -inset-px bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="relative flex items-start gap-3 bg-gray-50 rounded-2xl p-2 focus-within:bg-white transition-colors border border-gray-100">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs font-bold ring-2 ring-white ml-0.5 mt-0.5">
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
                ref={inputRef}
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
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
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="absolute right-2 bottom-2 w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-[14px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-1.5 px-4 md:px-5 pt-3 pb-0">
        <FontAwesomeIcon icon={faComment} className="text-gray-300 text-xs" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* List */}
      <div className="px-4 md:px-5 pb-2">
        {comments.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faComment}
                className="text-gray-300 text-2xl"
              />
            </div>
            <p className="text-sm text-gray-400 font-medium">
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} />)
        )}
      </div>
    </div>
  );
};

export default CommentsTab;
