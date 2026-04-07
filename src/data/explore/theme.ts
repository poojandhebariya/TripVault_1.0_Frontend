import {
  faSun,
  faTicket,
  faClock,
  faMountainSun,
  faLandmark,
  faWater,
  faLeaf,
  faCamera,
  faPrayingHands,
  faScroll,
  faCrown,
  faMasksTheater,
  faPalette,
  faUmbrellaBeach,
  faBinoculars,
  faPersonHiking,
  faFire,
  faSnowflake,
  faMoon,
  faCity,
  faDragon,
  faTree,
  faGem,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export const TYPE_ICONS: Record<string, IconDefinition> = {
  city: faCity,
  nature: faTree,
  heritage: faLandmark,
  beach: faUmbrellaBeach,
  mountain: faMountainSun,
  adventure: faPersonHiking,
  luxury: faGem,
};

export const TYPE_THEME: Record<
  string,
  { gradient: string; accent: string; bg: string; text: string; border: string }
> = {
  city: {
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    accent: "#6366f1",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  nature: {
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    accent: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  heritage: {
    gradient: "from-amber-500 via-orange-500 to-red-500",
    accent: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  beach: {
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    accent: "#06b6d4",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  mountain: {
    gradient: "from-blue-600 via-indigo-500 to-violet-600",
    accent: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  adventure: {
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    accent: "#f43f5e",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  luxury: {
    gradient: "from-slate-500 via-gray-500 to-zinc-600",
    accent: "#64748b",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export const DEFAULT_TYPE_THEME = {
  gradient: "from-gray-500 to-gray-600",
  accent: "#6b7280",
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-200",
};

export const ICON_MAP: Record<string, IconDefinition> = {
  faScroll: faScroll,
  faCrown: faCrown,
  faCamera: faCamera,
  faLandmark: faLandmark,
  faPrayingHands: faPrayingHands,
  faMasksTheater: faMasksTheater,
  faPalette: faPalette,
  faLeaf: faLeaf,
  faPersonHiking: faPersonHiking,
  faBinoculars: faBinoculars,
  faMountainSun: faMountainSun,
  faUmbrellaBeach: faUmbrellaBeach,
  faWater: faWater,
  faSun: faSun,
  faSnowflake: faSnowflake,
  faCity: faCity,
  faMoon: faMoon,
  faDragon: faDragon,
  faFire: faFire,
};

export const ACCENTS = [
  {
    accent: "#d97706",
    light: "bg-amber-50",
    border: "border-amber-100/80",
    text: "text-amber-700",
  },
  {
    accent: "#7c3aed",
    light: "bg-violet-50",
    border: "border-violet-100/80",
    text: "text-violet-700",
  },
  {
    accent: "#e11d48",
    light: "bg-rose-50",
    border: "border-rose-100/80",
    text: "text-rose-700",
  },
  {
    accent: "#0891b2",
    light: "bg-cyan-50",
    border: "border-cyan-100/80",
    text: "text-cyan-700",
  },
  {
    accent: "#16a34a",
    light: "bg-green-50",
    border: "border-green-100/80",
    text: "text-green-700",
  },
  {
    accent: "#0ea5e9",
    light: "bg-sky-50",
    border: "border-sky-100/80",
    text: "text-sky-700",
  },
  {
    accent: "#6366f1",
    light: "bg-indigo-50",
    border: "border-indigo-100/80",
    text: "text-indigo-700",
  },
  {
    accent: "#b45309",
    light: "bg-orange-50",
    border: "border-orange-100/80",
    text: "text-orange-700",
  },
];
