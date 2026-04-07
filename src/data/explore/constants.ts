export const CONTINENTS = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];

export const COUNTRY_PALETTES = [
  "from-violet-600 via-purple-600 to-indigo-700",
  "from-rose-500 via-pink-600 to-fuchsia-700",
  "from-cyan-500 via-teal-600 to-emerald-700",
  "from-amber-500 via-orange-500 to-red-600",
  "from-blue-600 via-indigo-600 to-violet-700",
  "from-emerald-500 via-green-600 to-teal-700",
  "from-fuchsia-600 via-pink-600 to-rose-700",
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-orange-500 via-red-500 to-rose-600",
  "from-teal-500 via-cyan-600 to-sky-700",
  "from-indigo-600 via-blue-600 to-cyan-600",
  "from-pink-500 via-rose-500 to-red-600",
];

export const PLACE_TYPES = [
  "city",
  "nature",
  "heritage",
  "beach",
  "mountain",
  "adventure",
  "luxury",
];

export const EXPLORE_TABS = [
  "Overview",
  "Travellers Post",
  "Map",
  "Reviews",
  "Places",
] as const;

export const REVIEW_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "highest", label: "Highest Rating" },
  { value: "lowest", label: "Lowest Rating" },
  { value: "helpful", label: "Most Helpful" },
] as const;

export const REVIEW_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];
