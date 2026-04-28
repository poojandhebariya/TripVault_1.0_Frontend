import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCheck, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@tanstack/react-query";
import type { VaultNotification } from "../../types/notifications";
import { ROUTES } from "../../utils/constants";
import { timeAgo } from "../../utils/formatters";
import { userMutation } from "../../tanstack/user/mutation";

const FollowNotificationCard = ({
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

  const { acceptFollowRequestMutation, declineFollowRequestMutation } = userMutation();
  const accept = useMutation(acceptFollowRequestMutation(notification.actor.id || ""));
  const decline = useMutation(declineFollowRequestMutation(notification.actor.id || ""));

  const isBusy = accept.isPending || decline.isPending;
  const isRequest = notification.type === "FOLLOW_REQUEST";

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
            {notification.type === "FOLLOW_REQUEST"
              ? "requested to follow you."
              : "started following you."}
          </p>
          <p className="text-[12px] text-gray-400 font-medium mt-0.5">
            {timeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isRequest ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); accept.mutate(); }}
                disabled={isBusy}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {accept.isPending ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                ) : (
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); decline.mutate(); }}
                disabled={isBusy}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 active:scale-95 text-gray-500 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer border border-gray-200"
              >
                {decline.isPending ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                ) : (
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleProfileClick}
              className="text-[13px] font-bold px-3.5 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowNotificationCard;
