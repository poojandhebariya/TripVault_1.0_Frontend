import type { VaultNotification } from "../../types/notifications";
import LikeNotificationCard from "./like-notification-card";
import TagNotificationCard from "./tag-notification-card";

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
    default:
      return null;
  }
};

export default NotificationCard;
