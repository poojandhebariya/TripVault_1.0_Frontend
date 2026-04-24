import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSlidersH,
  faChevronDown,
  faMagnifyingGlass,
  faFire,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import type {
  Tab,
  VaultFilters,
  PeopleFilters,
  PlacesFilters,
  SortOption,
} from "../../types/search";
import { BRAND_GRAD, BRAND_GRAD_R, fmtNum } from "./search-utils";

interface FilterPanelProps {
  activeTab: Tab;
  vaultFilters: VaultFilters;
  setVaultFilters: (f: VaultFilters) => void;
  peopleFilters: PeopleFilters;
  setPeopleFilters: (f: PeopleFilters) => void;
  placesFilters: PlacesFilters;
  setPlacesFilters: (f: PlacesFilters) => void;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
  DEFAULT_VAULT_FILTERS: VaultFilters;
  DEFAULT_PEOPLE_FILTERS: PeopleFilters;
  DEFAULT_PLACES_FILTERS: PlacesFilters;
}

const FilterPanel = ({
  activeTab,
  vaultFilters,
  setVaultFilters,
  peopleFilters,
  setPeopleFilters,
  placesFilters,
  setPlacesFilters,
  filtersOpen,
  setFiltersOpen,
  DEFAULT_VAULT_FILTERS,
  DEFAULT_PEOPLE_FILTERS,
  DEFAULT_PLACES_FILTERS,
}: FilterPanelProps) => {
  const hasActiveFilters =
    (activeTab === "vaults" &&
      (vaultFilters.sort !== "relevance" ||
        vaultFilters.mood !== "" ||
        vaultFilters.timeframe !== "")) ||
    (activeTab === "people" &&
      (peopleFilters.sort !== "relevance" ||
        peopleFilters.followingOnly ||
        peopleFilters.minFollowers > 0 ||
        peopleFilters.tripType !== "" ||
        peopleFilters.country !== "")) ||
    (activeTab === "places" &&
      (placesFilters.sort !== "relevance" || placesFilters.minVaults > 0));

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: BRAND_GRAD }}
          >
            <FontAwesomeIcon icon={faSlidersH} className="text-white text-xs" />
          </div>
          <span className="font-bold text-gray-800 text-sm">Filters</span>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#1d4ed8" }}
            />
          )}
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-gray-400 text-xs transition-transform duration-200"
          style={{ transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {filtersOpen && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
          {/* Sort by */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Sort by
            </p>
            <div className="flex flex-col gap-1">
              {(
                [
                  { id: "relevance", label: "Relevance", icon: faMagnifyingGlass },
                  { id: "popular", label: "Most popular", icon: faFire },
                  { id: "recent", label: "Newest first", icon: faClock },
                ] as { id: SortOption; label: string; icon: any }[]
              ).map((opt) => {
                const current =
                  activeTab === "vaults"
                    ? vaultFilters.sort
                    : activeTab === "people"
                    ? peopleFilters.sort
                    : placesFilters.sort;
                const active = current === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (activeTab === "vaults")
                        setVaultFilters({ ...vaultFilters, sort: opt.id });
                      else if (activeTab === "people")
                        setPeopleFilters({ ...peopleFilters, sort: opt.id });
                      else
                        setPlacesFilters({ ...placesFilters, sort: opt.id });
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer"
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(to right, #eff6ff, #f5f3ff)",
                            color: "#1d4ed8",
                            fontWeight: 700,
                          }
                        : { color: "#6b7280" }
                    }
                  >
                    <FontAwesomeIcon
                      icon={opt.icon}
                      className="text-xs w-3"
                      style={{ color: active ? "#1d4ed8" : "#9ca3af" }}
                    />
                    {opt.label}
                    {active && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: "#1d4ed8" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab-specific filters */}
          {activeTab === "vaults" && (
            <>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Mood / Vibe
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "",
                    "adventurous",
                    "relaxed",
                    "romantic",
                    "cultural",
                    "foodie",
                    "spiritual",
                  ].map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setVaultFilters({ ...vaultFilters, mood: m })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize"
                      style={
                        vaultFilters.mood === m
                          ? {
                              background: BRAND_GRAD_R,
                              color: "#fff",
                              borderColor: "transparent",
                            }
                          : {
                              background: "#fff",
                              color: "#6b7280",
                              borderColor: "#e5e7eb",
                            }
                      }
                    >
                      {m === "" ? "Any" : m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Timeframe
                </p>
                <select
                  value={vaultFilters.timeframe}
                  onChange={(e) =>
                    setVaultFilters({
                      ...vaultFilters,
                      timeframe: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Anytime</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
            </>
          )}

          {activeTab === "people" && (
            <>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Trip Style
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["", "SOLO", "FRIENDS", "FAMILY", "COUPLE"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setPeopleFilters({ ...peopleFilters, tripType: t })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize"
                      style={
                        peopleFilters.tripType === t
                          ? {
                              background: BRAND_GRAD_R,
                              color: "#fff",
                              borderColor: "transparent",
                            }
                          : {
                              background: "#fff",
                              color: "#6b7280",
                              borderColor: "#e5e7eb",
                            }
                      }
                    >
                      {t === "" ? "Any" : t.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Country
                </p>
                <input
                  type="text"
                  placeholder="e.g. Italy, Bali..."
                  value={peopleFilters.country}
                  onChange={(e) =>
                    setPeopleFilters({
                      ...peopleFilters,
                      country: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Min. Followers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 10, 100, 1000].map((n) => (
                    <button
                      key={n}
                      onClick={() =>
                        setPeopleFilters({ ...peopleFilters, minFollowers: n })
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                      style={
                        peopleFilters.minFollowers === n
                          ? {
                              background: BRAND_GRAD_R,
                              color: "#fff",
                              borderColor: "transparent",
                            }
                          : {
                              background: "#fff",
                              color: "#6b7280",
                              borderColor: "#e5e7eb",
                            }
                      }
                    >
                      {n === 0 ? "Any" : `${fmtNum(n)}+`}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <div
                  className="w-9 h-5 rounded-full transition-all duration-200 relative"
                  style={{
                    background: peopleFilters.followingOnly
                      ? BRAND_GRAD_R
                      : "#e5e7eb",
                  }}
                  onClick={() =>
                    setPeopleFilters({
                      ...peopleFilters,
                      followingOnly: !peopleFilters.followingOnly,
                    })
                  }
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                    style={{
                      left: peopleFilters.followingOnly
                        ? "calc(100% - 18px)"
                        : "2px",
                    }}
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  Following only
                </span>
              </label>
            </>
          )}

          {activeTab === "places" && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Min. Vaults
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[0, 5, 20, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setPlacesFilters({ ...placesFilters, minVaults: n })
                    }
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                    style={
                      placesFilters.minVaults === n
                        ? {
                            background: BRAND_GRAD_R,
                            color: "#fff",
                            borderColor: "transparent",
                          }
                        : {
                            background: "#fff",
                            color: "#6b7280",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    {n === 0 ? "Any" : `${n}+`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                if (activeTab === "vaults")
                  setVaultFilters(DEFAULT_VAULT_FILTERS);
                else if (activeTab === "people")
                  setPeopleFilters(DEFAULT_PEOPLE_FILTERS);
                else setPlacesFilters(DEFAULT_PLACES_FILTERS);
              }}
              className="w-full py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
