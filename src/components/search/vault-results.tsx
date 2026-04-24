import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faLocationDot,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type {
  SearchItemVault,
  VaultFilters,
  ViewMode,
} from "../../types/search";
import { BRAND_GRAD, fmtNum } from "./search-utils";

interface SectionHeaderProps {
  label: string;
  total: number;
}

const SectionHeader = ({ label, total }: SectionHeaderProps) => (
  <div className="md:hidden! flex items-center justify-between pb-3 mb-1">
    <p className="text-xs font-black uppercase tracking-widest text-blue-700">
      {label}
    </p>
    <span className="text-xs text-gray-400 font-medium">
      {fmtNum(total)} result{total !== 1 ? "s" : ""}
    </span>
  </div>
);

interface VaultResultsProps {
  items: SearchItemVault[];
  total: number;
  viewMode: ViewMode;
  filters: VaultFilters;
  onOpen: (id: string) => void;
}

const VaultResults = ({
  items,
  total,
  viewMode,
  filters,
  onOpen,
}: VaultResultsProps) => {
  const displayItems = items;

  if (!displayItems.length)
    return (
      <p className="py-10 text-center text-[13px] text-gray-400">
        No vaults matched your search
        {filters.mood !== "" || filters.timeframe !== ""
          ? " with current filters"
          : ""}
        .
      </p>
    );

  if (viewMode === "grid") {
    return (
      <div>
        <SectionHeader label="Vaults" total={total} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayItems.map((v) => (
            <button
              key={v.id}
              onClick={() => onOpen(v.id)}
              className="group text-left bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                {v.coverImageUrl ? (
                  <img
                    src={v.coverImageUrl}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faFolder}
                      className="text-gray-300 text-3xl"
                    />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                  {v.title}
                </p>
                {v.locationLabel && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="text-rose-400 text-[10px] flex-shrink-0"
                    />
                    {v.locationLabel}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader label="Vaults" total={total} />
      <div className="flex flex-col gap-2">
        {displayItems.map((v) => (
          <button
            key={v.id}
            onClick={() => onOpen(v.id)}
            className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-100 text-left hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-pointer group"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className="w-28 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              {v.coverImageUrl ? (
                <img
                  src={v.coverImageUrl}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faFolder}
                    className="text-gray-300 text-xl"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                {v.title}
              </p>
              {v.locationLabel && (
                <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1.5 truncate">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-rose-400 text-[11px] flex-shrink-0"
                  />
                  {v.locationLabel}
                </p>
              )}
              {v.authorName && (
                <div className="flex items-center gap-1.5 mt-1">
                  {v.authorProfilePicUrl ? (
                    <img
                      src={v.authorProfilePicUrl}
                      className="w-4 h-4 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: BRAND_GRAD }}
                    />
                  )}
                  <span className="text-xs text-gray-400 truncate">
                    {v.authorName}
                  </span>
                </div>
              )}
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-gray-200 group-hover:text-blue-400 transition-colors text-xs flex-shrink-0 self-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default VaultResults;
export { SectionHeader };
