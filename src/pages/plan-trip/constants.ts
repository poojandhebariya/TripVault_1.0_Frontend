import { faSun, faCamera, faMoon } from "@fortawesome/free-solid-svg-icons";

export const DURATION_OPTIONS = [
  { days: 1, label: "1 Day", sub: "Quick" },
  { days: 2, label: "2 Days", sub: "Weekend" },
  { days: 3, label: "3 Days", sub: "Long w/e" },
  { days: 4, label: "4 Days", sub: "Mini Break" },
  { days: 5, label: "5 Days", sub: "Full Week" },
  { days: 7, label: "7 Days", sub: "Deep Dive" },
];

export const TIME_ICON: Record<string, any> = {
  morning: faSun,
  afternoon: faCamera,
  evening: faMoon,
  night: faMoon,
};

export const TIME_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  morning: {
    text: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  afternoon: {
    text: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  evening: {
    text: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  night: {
    text: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
};
