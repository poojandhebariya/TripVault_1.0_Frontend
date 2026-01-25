import {
  faUser,
  faUserGroup,
  faUsers,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

export const tripTypesData = [
  { id: "solo", label: "Solo", icon: faUser, color: "text-blue-500" },
  {
    id: "friends",
    label: "Friends",
    icon: faUserGroup,
    color: "text-indigo-500",
  },
  { id: "family", label: "Family", icon: faUsers, color: "text-green-600" },
  { id: "couple", label: "Couple", icon: faHeart, color: "text-rose-500" },
];
