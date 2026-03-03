import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faMapLocationDot,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

export type FeedFilter = "trending" | "nearby" | "following";

const FILTERS: { key: FeedFilter; label: string; icon: typeof faFire }[] = [
  { key: "trending", label: "Trending", icon: faFire },
  { key: "nearby", label: "Nearby", icon: faMapLocationDot },
  { key: "following", label: "Following", icon: faUsers },
];

interface Props {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
}

const FeedFilter = ({ active, onChange }: Props) => (
  <div className="flex items-center gap-2 px-4 md:px-0">
    {FILTERS.map((f) => {
      const isActive = active === f.key;
      return (
        <div key={f.key} className="relative group">
          <button
            onClick={() => onChange(f.key)}
            className={`flex items-center rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white border-transparent shadow-md shadow-blue-100 cursor-pointer"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <FontAwesomeIcon
              icon={f.icon}
              className={`text-xs transition-colors duration-300 ${
                isActive ? "text-white" : "text-gray-400"
              }`}
            />

            <span
              className={`
                overflow-hidden whitespace-nowrap
                transition-all duration-500 ease-in-out
                md:ml-2 md:max-w-xs md:opacity-100
                ${
                  isActive
                    ? "ml-2 max-w-[120px] opacity-100"
                    : "ml-0 max-w-0 opacity-0"
                }
              `}
            >
              {f.label}
            </span>
          </button>
        </div>
      );
    })}
  </div>
);

export default FeedFilter;
