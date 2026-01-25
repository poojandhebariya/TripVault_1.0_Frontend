import {
  faPlane,
  faUtensils,
  faLeaf,
  faUmbrellaBeach,
  faMountain,
  faHotel,
  faWallet,
  faHiking,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";

export const interestsData = [
  { id: "travel", label: "Travel", icon: faPlane, color: "text-sky-500" },
  {
    id: "food",
    label: "Food & Cafes",
    icon: faUtensils,
    color: "text-orange-500",
  },
  { id: "nature", label: "Nature", icon: faLeaf, color: "text-green-500" },
  {
    id: "beaches",
    label: "Beaches",
    icon: faUmbrellaBeach,
    color: "text-yellow-500",
  },
  {
    id: "mountains",
    label: "Mountains",
    icon: faMountain,
    color: "text-stone-600",
  },
  {
    id: "luxury",
    label: "Luxury stays",
    icon: faHotel,
    color: "text-purple-500",
  },
  {
    id: "budget",
    label: "Budget travel",
    icon: faWallet,
    color: "text-emerald-600",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: faHiking,
    color: "text-red-500",
  },
  {
    id: "photography",
    label: "Photography",
    icon: faCamera,
    color: "text-zinc-600",
  },
];
