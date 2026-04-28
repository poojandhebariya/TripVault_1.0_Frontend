import type { VaultNotification } from "../../types/notifications";
import LikeNotificationCard from "./like-notification-card";
import TagNotificationCard from "./tag-notification-card";
import CommentNotificationCard from "./comment-notification-card";
import FollowNotificationCard from "./follow-notification-card";
import TagAcceptedNotificationCard from "./tag-accepted-notification-card";
import SaveNotificationCard from "./save-notification-card";
import FollowAcceptedNotificationCard from "./follow-accepted-notification-card";

const NotificationCard = ({
  notification,
}: {
  notification: VaultNotification;
}) => {
  switch (notification.type) {
    case "LIKE":
      return <LikeNotificationCard notification={notification} />;
    case "TAG":
      return <TagNotificationCard notification={notification} />;
    case "COMMENT":
    case "COMMENT_TAG":
    case "COMMENT_REPLY":
      return <CommentNotificationCard notification={notification} />;
    case "FOLLOW":
    case "FOLLOW_REQUEST":
      return <FollowNotificationCard notification={notification} />;
    case "FOLLOW_ACCEPTED":
      return <FollowAcceptedNotificationCard notification={notification} />;
    case "TAG_ACCEPTED":
      return <TagAcceptedNotificationCard notification={notification} />;
    case "SAVE":
      return <SaveNotificationCard notification={notification} />;
    default:
      return null;
  }
};

export default NotificationCard;
