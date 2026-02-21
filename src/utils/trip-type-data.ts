import {
  faUser,
  faUserGroup,
  faUsers,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

export const tripTypesData = [
  { id: "SOLO", label: "Solo", icon: faUser, color: "text-blue-500" },
  {
    id: "FRIENDS",
    label: "Friends",
    icon: faUserGroup,
    color: "text-indigo-500",
  },
  { id: "FAMILY", label: "Family", icon: faUsers, color: "text-green-600" },
  { id: "COUPLE", label: "Couple", icon: faHeart, color: "text-rose-500" },
];
