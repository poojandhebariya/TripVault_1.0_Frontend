import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobeAmericas,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import type { Tab, ViewMode } from "../../types/search";
import { BRAND_GRAD } from "./search-utils";

export const SearchPrompt = () => (
  <div className="flex flex-col items-center gap-6 py-20 text-center">
    <div
      className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
      style={{
        background: BRAND_GRAD,
        boxShadow: "0 16px 40px rgba(29,78,216,0.25)",
      }}
    >
      <FontAwesomeIcon icon={faGlobeAmericas} className="text-white text-4xl" />
    </div>
    <div>
      <h2 className="text-2xl font-extrabold gradient-text w-fit mx-auto pb-1">
        Discover the world
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mt-1 leading-relaxed">
        Search vaults, travellers, and destinations to start your next
        adventure.
      </p>
    </div>
    <div className="flex flex-wrap gap-2 justify-center mt-1">
      {[
        "🏔 Mountains",
        "🏖 Beaches",
        "🌏 Asia",
        "🍣 Tokyo",
        "🧳 Solo travel",
        "🏛 Europe",
      ].map((tag) => (
        <span
          key={tag}
          className="px-3.5 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 font-semibold bg-white cursor-pointer hover:border-blue-300 hover:text-blue-700 transition-all"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export const NoResults = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-3xl bg-gray-50">
      😶
    </div>
    <p className="text-[17px] font-bold text-gray-900">
      Nothing found for "{query}"
    </p>
    <p className="text-[13px] text-gray-400 max-w-[260px] leading-relaxed">
      Try a different keyword or a shorter phrase.
    </p>
  </div>
);

export const SearchSkeletons = ({
  tab,
  viewMode,
}: {
  tab: Tab;
  viewMode: ViewMode;
}) => {
  if (tab === "vaults" && viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-gray-100 aspect-[4/3]" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col animate-pulse border-t border-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 py-4 border-b border-gray-100"
        >
          <div
            className={`bg-gray-100 flex-shrink-0 ${
              tab === "vaults" ? "w-16 h-16 rounded-xl" : "w-11 h-11 rounded-full"
            }`}
          />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="h-3 bg-gray-100 rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
