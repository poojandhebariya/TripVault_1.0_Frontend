import {
  faEllipsisVertical,
  faUserPlus,
  faUserMinus,
  faFlag,
  faMapLocationDot,
  faBan,
  faPencil,
  faTrash,
  faThumbTack,
  faChartBar,
  faList,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DropdownMenu, { type DropdownMenuItem } from "./ui/dropdown-menu";

export interface PostMenuProps {
  isOwner: boolean;
  isFollowing?: boolean;
  requestPending?: boolean;
  hasLocation?: boolean;
  isPinned?: boolean;
  isPublished?: boolean;
  isBucketListed?: boolean;
  onFollow?: () => void;
  onReport?: () => void;
  onNavigateMap?: () => void;
  onNotInterested?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onViewInsights?: () => void;
  onAddToBucketList?: () => void;
}

const VaultPostMenu = ({
  isOwner,
  isFollowing = false,
  hasLocation = false,
  isPinned = false,
  isPublished = false,
  isBucketListed = false,
  requestPending = false,
  onFollow,
  onReport,
  onNavigateMap,
  onNotInterested,
  onEdit,
  onDelete,
  onPin,
  onViewInsights,
  onAddToBucketList,
}: PostMenuProps) => {
  const guestItems: DropdownMenuItem[] = [
    {
      icon: isFollowing ? faUserMinus : requestPending ? faUserClock : faUserPlus,
      label: isFollowing ? "Unfollow" : requestPending ? "Requested" : "Follow",
      onClick: () => onFollow?.(),
    },
    ...(!isBucketListed
      ? [
          {
            icon: faList,
            label: "Add to Bucketlist",
            onClick: () => onAddToBucketList?.(),
          },
        ]
      : []),
    ...(hasLocation
      ? [
          {
            icon: faMapLocationDot,
            label: "View on Map",
            onClick: () => onNavigateMap?.(),
          },
        ]
      : []),
    {
      icon: faBan,
      label: "Not Interested",
      onClick: () => onNotInterested?.(),
    },
    {
      icon: faFlag,
      label: "Report Post",
      variant: "danger",
      onClick: () => onReport?.(),
    },
  ];

  const ownerItems: DropdownMenuItem[] = [
    {
      icon: faPencil,
      label: "Edit",
      onClick: () => onEdit?.(),
    },
    ...(hasLocation
      ? [
          {
            icon: faMapLocationDot,
            label: "View on Map",
            onClick: () => onNavigateMap?.(),
          },
        ]
      : []),
    ...(isPublished
      ? [
          {
            icon: faThumbTack,
            label: isPinned ? "Unpin Post" : "Pin Post",
            onClick: () => onPin?.(),
          },
        ]
      : []),
    {
      icon: faChartBar,
      label: "View Insights",
      onClick: () => onViewInsights?.(),
    },
    {
      icon: faTrash,
      label: "Delete",
      variant: "danger",
      onClick: () => onDelete?.(),
    },
  ];

  const items = isOwner ? ownerItems : guestItems;

  return (
    <DropdownMenu
      trigger={
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 cursor-pointer active:scale-95"
          aria-label="Post options"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="text-sm" />
        </button>
      }
      items={items}
    />
  );
};

export default VaultPostMenu;
