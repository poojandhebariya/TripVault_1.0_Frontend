import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages, faUser } from "@fortawesome/free-solid-svg-icons";
import type { VaultNotification } from "../../types/notifications";
import { ROUTES } from "../../utils/constants";
import { timeAgo } from "../../utils/formatters";

const CommentNotificationCard = ({
  notification,
}: {
  notification: VaultNotification;
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (notification.actor.id) {
      navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(notification.actor.id));
    }
  };

  const handleVaultClick = () => {
    if (notification.vaultId) {
      navigate(`/vault/${notification.vaultId}`);
    }
  };

  const isMention = notification.type === "COMMENT_TAG";
  const isReply = notification.type === "COMMENT_REPLY";

  return (
    <div className="py-4 px-4 border-b border-gray-100 flex items-start md:items-center transition-colors hover:bg-gray-50/50">
      <div className="flex gap-3 items-start md:items-center w-full">
        {/* Profile Avatar */}
        <div onClick={handleProfileClick} className="cursor-pointer shrink-0">
          {notification.actor.profilePicUrl ? (
            <img
              src={notification.actor.profilePicUrl}
              alt={notification.actor.name ?? ""}
              className="w-11 h-11 rounded-full object-cover shadow-sm hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:opacity-90 transition-opacity">
              <FontAwesomeIcon
                icon={faUser}
                className="text-gray-600 text-[15px]"
              />
            </div>
          )}
        </div>

        {/* Action text */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[14px] text-gray-800 leading-snug">
            <span
              onClick={handleProfileClick}
              className="font-bold text-gray-900 cursor-pointer hover:underline"
            >
              {notification.actor.name ?? notification.actor.username}
            </span>{" "}
            {isMention ? "mentioned you in a comment on" : isReply ? "replied to your comment on" : "commented on"}{" "}
            <span
              onClick={handleVaultClick}
              className="font-semibold text-gray-900 cursor-pointer hover:underline"
            >
              {notification.vaultTitle}
            </span>
          </p>

          {/* Comment snippet */}
          {notification.commentText && (
            <p
              onClick={handleVaultClick}
              className="mt-1 text-[13px] text-gray-500 italic line-clamp-2 cursor-pointer hover:text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 leading-relaxed"
            >
              "{notification.commentText}"
            </p>
          )}

          <p className="text-[12px] text-gray-400 font-medium mt-1">
            {timeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Vault Thumbnail */}
        <div onClick={handleVaultClick} className="shrink-0 cursor-pointer">
          {notification.vaultCoverUrl ? (
            <img
              src={notification.vaultCoverUrl}
              alt="Cover"
              className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-95 transition-opacity"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:opacity-95 transition-opacity">
              <FontAwesomeIcon
                icon={faImages}
                className="text-gray-300 text-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentNotificationCard;
