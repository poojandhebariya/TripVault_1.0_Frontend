import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck,
  faSuitcase,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { SearchItemUser, PeopleFilters } from "../../types/search";
import { BRAND_GRAD, fmtNum } from "./search-utils";
import { SectionHeader } from "./vault-results";

interface PeopleResultsProps {
  items: SearchItemUser[];
  total: number;
  filters: PeopleFilters;
  onOpen: (id: string) => void;
}

const PeopleResults = ({ items, total, filters, onOpen }: PeopleResultsProps) => {
  const displayItems = items;

  if (!displayItems.length)
    return (
      <p className="py-10 text-center text-[13px] text-gray-400">
        No travellers matched your search.
      </p>
    );
  return (
    <div>
      <SectionHeader label="People" total={total} />
      <div className="flex flex-col gap-2">
        {displayItems.map((u) => (
          <button
            key={u.id}
            onClick={() => onOpen(u.id)}
            className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 text-left hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-pointer group"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            {u.profilePicUrl ? (
              <img
                src={u.profilePicUrl}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-base shadow-sm"
                style={{ background: BRAND_GRAD }}
              >
                {u.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                  {u.name}
                </p>
                {u.isFollowing && (
                  <span className="flex-shrink-0 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Following
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                @{u.username}
              </p>
              {u.bio && (
                <p className="text-[13px] text-gray-500 mt-1 line-clamp-1">
                  {u.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FontAwesomeIcon icon={faUserCheck} className="text-[10px]" />
                  {fmtNum(u.followersCount)} followers
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FontAwesomeIcon icon={faSuitcase} className="text-[10px]" />
                  {fmtNum(u.vaultsCount)} vaults
                </span>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: u.isFollowing ? "#ecfdf5" : "#eff6ff" }}
            >
              <FontAwesomeIcon
                icon={u.isFollowing ? faUserCheck : faUserPlus}
                className="text-xs"
                style={{ color: u.isFollowing ? "#10b981" : "#1d4ed8" }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeopleResults;
