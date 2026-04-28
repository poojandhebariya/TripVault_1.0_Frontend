import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import type { VaultNotification } from "../../types/notifications";
import { ROUTES } from "../../utils/constants";
import { timeAgo } from "../../utils/formatters";

const FollowAcceptedNotificationCard = ({
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

  return (
    <div className="py-4 px-4 border-b border-gray-100 flex items-center transition-colors hover:bg-gray-50/50">
      <div className="flex gap-3 items-center w-full">
        {/* Profile Avatar */}
        <div
          onClick={handleProfileClick}
          className="cursor-pointer shrink-0"
        >
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
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-gray-800 leading-snug">
            <span
              onClick={handleProfileClick}
              className="font-bold text-gray-900 cursor-pointer hover:underline"
            >
              {notification.actor.name ?? notification.actor.username}
            </span>{" "}
            accepted your follow request.
          </p>
          <p className="text-[12px] text-gray-400 font-medium mt-0.5">
            {timeAgo(notification.createdAt)}
          </p>
        </div>

        {/* View Profile CTA */}
        <button
          onClick={handleProfileClick}
          className="shrink-0 text-[13px] font-bold px-3.5 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 active:scale-95 transition-all cursor-pointer"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default FollowAcceptedNotificationCard;
