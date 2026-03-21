import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTag,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { userMutation } from "../../../tanstack/user/mutation";
import type { VaultTagNotification } from "../../../types/notifications";
import Button from "../../../components/ui/button";
import { ROUTES } from "../../../utils/constants";
import StatusBadge from "./status-badge";

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ago`;
  if (hr > 0) return `${hr}h ago`;
  if (min > 0) return `${min}m ago`;
  return "Just now";
};

const NotificationCard = ({
  notification,
}: {
  notification: VaultTagNotification;
}) => {
  const navigate = useNavigate();
  const { respondToTagMutation } = userMutation();
  const [pendingAction, setPendingAction] = useState<
    "accepted" | "declined" | null
  >(null);

  const respondMut = useMutation({
    ...respondToTagMutation(notification.id),
    onMutate: (action: "accepted" | "declined") => {
      setPendingAction(action);
    },
    onSettled: () => {
      setPendingAction(null);
    },
  });

  const isPending = notification.status === "pending";

  const handleProfileClick = () => {
    if (notification.tagger.id) {
      navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(notification.tagger.id));
    }
  };

  const handleVaultClick = () => {
    if (notification.vaultId) {
      navigate(`/vault/${notification.vaultId}`);
    }
  };

  return (
    <div className="py-5 px-4 border-b-2 border-gray-100 flex flex-col transition-colors hover:bg-gray-50/50">
      {/* Header: Avatar + Text */}
      <div className="flex gap-3 items-start">
        <div
          onClick={handleProfileClick}
          className="cursor-pointer shrink-0 mt-0.5"
        >
          {notification.tagger.profilePicUrl ? (
            <img
              src={notification.tagger.profilePicUrl}
              alt={notification.tagger.name ?? ""}
              className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center hover:opacity-90 transition-opacity">
              <FontAwesomeIcon
                icon={faUserTag}
                className="text-indigo-400 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 self-center">
          <p className="text-[15px] text-gray-800 leading-snug">
            <span
              onClick={handleProfileClick}
              className="font-bold text-gray-900 cursor-pointer hover:underline"
            >
              {notification.tagger.name ?? notification.tagger.username}
            </span>{" "}
            tagged you in a vault —{" "}
            <span
              onClick={handleVaultClick}
              className="font-semibold text-gray-900 inline cursor-pointer hover:underline"
            >
              {notification.vaultTitle}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] text-gray-400 font-medium">
              {timeAgo(notification.createdAt)}
            </span>
            <span className="text-gray-300">·</span>
            <StatusBadge status={notification.status} />
          </div>
        </div>
      </div>

      {/* Big Vault Cover */}
      <div
        onClick={handleVaultClick}
        className="cursor-pointer mt-3 w-full"
      >
        {notification.vaultCoverUrl ? (
          <img
            src={notification.vaultCoverUrl}
            alt="Cover"
            className="w-full h-48 sm:h-64 object-cover rounded-xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:opacity-95 transition-opacity"
          />
        ) : (
          <div className="w-full h-40 sm:h-56 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:opacity-95 transition-opacity shrink-0">
            <FontAwesomeIcon
              icon={faImages}
              className="text-gray-300 text-3xl"
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isPending && (
        <div className="flex gap-3 pt-4 items-center">
          <Button
            variant="default"
            text="Accept"
            className="py-2.5 px-4 flex-1 text-sm font-bold shadow-sm rounded-xl"
            onClick={() => respondMut.mutate("accepted")}
            loading={pendingAction === "accepted" && respondMut.isPending}
            disabled={respondMut.isPending}
          />
          <Button
            variant="outline"
            text="Decline"
            className="flex-1 py-2.5 px-4 shadow-none border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-sm font-bold rounded-xl"
            outlineClassName="!p-0 !bg-transparent flex-1 flex rounded-[14px]"
            onClick={() => respondMut.mutate("declined")}
            loading={pendingAction === "declined" && respondMut.isPending}
            disabled={respondMut.isPending}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
