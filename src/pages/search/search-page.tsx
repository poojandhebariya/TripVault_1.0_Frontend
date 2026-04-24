import { useState, useEffect, useRef, useCallback } from "react";
import useIsMobile from "../../hooks/isMobile";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import { searchQueries } from "../../tanstack/search/queries";
import { ROUTES } from "../../utils/constants";
import MobileStickyHeader from "../../components/mobile-sticky-header";

// Components
import SearchHero from "../../components/search/search-hero";
import SearchBar from "../../components/search/search-bar";
import FilterPanel from "../../components/search/filter-panel";
import TabSwitcher from "../../components/search/tab-switcher";
import VaultResults from "../../components/search/vault-results";
import PeopleResults from "../../components/search/people-results";
import PlacesResults from "../../components/search/places-results";
import {
  SearchPrompt,
  NoResults,
  SearchSkeletons,
} from "../../components/search/search-placeholders";

// Types & Utils
import type {
  Tab,
  ViewMode,
  VaultFilters,
  PeopleFilters,
  PlacesFilters,
} from "../../types/search";
import {
  loadRecent,
  addRecent,
  BRAND_GRAD_R,
} from "../../components/search/search-utils";

const DEFAULT_VAULT_FILTERS: VaultFilters = {
  sort: "relevance",
  mood: "",
  timeframe: "",
};
const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
  sort: "relevance",
  followingOnly: false,
  minFollowers: 0,
  tripType: "",
  country: "",
};
const DEFAULT_PLACES_FILTERS: PlacesFilters = {
  sort: "relevance",
  minVaults: 0,
};

const SearchPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search } = searchQueries();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive query + tab from URL so state persists across back-navigation
  const urlQuery = searchParams.get("q") ?? "";
  const urlTab = (searchParams.get("tab") as Tab | null) ?? "vaults";

  const [rawQuery, setRawQueryState] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [suggestQuery, setSuggestQuery] = useState("");
  const [activeTab, setActiveTabState] = useState<Tab>(urlTab);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [vaultFilters, setVaultFilters] = useState<VaultFilters>(
    DEFAULT_VAULT_FILTERS
  );
  const [peopleFilters, setPeopleFilters] = useState<PeopleFilters>(
    DEFAULT_PEOPLE_FILTERS
  );
  const [placesFilters, setPlacesFilters] = useState<PlacesFilters>(
    DEFAULT_PLACES_FILTERS
  );

  // Keep rawQuery in sync when user navigates back (URL changes externally)
  // Guard: only update if actually different to avoid re-triggering debounces
  useEffect(() => {
    if (rawQuery !== urlQuery) {
      setRawQueryState(urlQuery);
    }
    if (debouncedQuery !== urlQuery) {
      setDebouncedQuery(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Sync activeTab from URL
  useEffect(() => {
    if (activeTab !== urlTab) setActiveTabState(urlTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  // Helper: update rawQuery + mirror to URL
  const setRawQuery = useCallback(
    (v: string) => {
      setRawQueryState(v);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (v.trim()) next.set("q", v.trim());
          else next.delete("q");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Helper: update activeTab + mirror to URL
  const setActiveTab = useCallback(
    (tab: Tab) => {
      setActiveTabState(tab);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (tab !== "vaults") next.set("tab", tab);
          else next.delete("tab");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Debounce rawQuery → debouncedQuery (skip if already in sync)
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = rawQuery.trim();
      if (trimmed !== debouncedQuery) setDebouncedQuery(trimmed);
    }, 600);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuery]);
  useEffect(() => {
    const id = setTimeout(() => setSuggestQuery(rawQuery.trim()), 400);
    return () => clearTimeout(id);
  }, [rawQuery]);

  const activeFilters =
    activeTab === "vaults"
      ? vaultFilters
      : activeTab === "people"
      ? peopleFilters
      : placesFilters;

  // isLoading = no cached data yet (initial fetch); isFetching = any fetch including background
  const { data, isFetching, isLoading, isError } = useQuery({
    ...search(debouncedQuery, 8, activeTab, activeFilters),
    enabled: debouncedQuery.length >= 2,
  });
  const { data: suggest } = useQuery({
    ...search(suggestQuery, 3, "all"),
    enabled: suggestQuery.length >= 2 && focused,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClear = () => {
    setRawQuery("");
    setDebouncedQuery("");
    setSuggestQuery("");
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setRecent(addRecent(trimmed));
      setRawQuery(trimmed);
      setDebouncedQuery(trimmed);
      setFocused(false);
      inputRef.current?.blur();
    },
    [setRawQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit(rawQuery);
    if (e.key === "Escape") setFocused(false);
  };

  const removeRecent = (term: string) => {
    const next = recent.filter((s) => s !== term);
    setRecent(next);
    localStorage.setItem("tripvault_recent_searches", JSON.stringify(next));
  };

  const showDropdown =
    focused && (rawQuery.length === 0 || suggestQuery.length >= 2);
  const hasResults =
    data && (data.vaultsTotal > 0 || data.usersTotal > 0 || data.locationsTotal > 0);
  const tabCounts: Record<Tab, number> = {
    vaults: data?.vaultsTotal ?? 0,
    people: data?.usersTotal ?? 0,
    places: data?.locationsTotal ?? 0,
  };

  const showSidebar = debouncedQuery.length >= 2;

  const searchBarProps = {
    inputRef,
    dropdownRef,
    rawQuery,
    setRawQuery,
    focused,
    setFocused,
    handleKeyDown,
    handleClear,
    showDropdown,
    recent,
    setRecent,
    suggestQuery,
    suggest,
    handleSubmit,
    removeRecent,
  };

  return (
    <div className="animate-[slideDown_0.3s_ease-out] min-h-screen pb-24 bg-white">
      {/* Mobile sticky header */}
      <MobileStickyHeader title="Search" />

      {/* ── Hero search bar ── */}
      <SearchHero {...searchBarProps} />

      {/* ── Mobile search bar ── */}
      <div className="lg:hidden px-4 mt-4 mb-2">
        <SearchBar {...searchBarProps} />
      </div>

      <div className="max-w-7xl mx-auto md:py-4 md:px-6 xl:px-8">
        <div className="flex gap-6">
          {/* ── Left filter sidebar ── */}
          {showSidebar && (
            <aside className="hidden lg:flex flex-col w-64 shrink-0">
              <div className="sticky top-24 space-y-4">
                <FilterPanel
                  activeTab={activeTab}
                  vaultFilters={vaultFilters}
                  setVaultFilters={setVaultFilters}
                  peopleFilters={peopleFilters}
                  setPeopleFilters={setPeopleFilters}
                  placesFilters={placesFilters}
                  setPlacesFilters={setPlacesFilters}
                  filtersOpen={filtersOpen}
                  setFiltersOpen={setFiltersOpen}
                  DEFAULT_VAULT_FILTERS={DEFAULT_VAULT_FILTERS}
                  DEFAULT_PEOPLE_FILTERS={DEFAULT_PEOPLE_FILTERS}
                  DEFAULT_PLACES_FILTERS={DEFAULT_PLACES_FILTERS}
                />
              </div>
            </aside>
          )}

          {/* ── Main column ── */}
          <main className="flex-1 min-w-0 px-4 md:px-0">
            {/* Tab bar + layout toggle */}
            <TabSwitcher
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabCounts={tabCounts}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showDropdown={showDropdown}
              debouncedQuery={debouncedQuery}
            />

            {/* Mobile filters FAB — fixed bottom-right, below md only */}
            {isMobile && showSidebar && !showDropdown && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="fixed bottom-24 right-4 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg active:scale-95 transition-transform"
              >
                <FontAwesomeIcon icon={faSlidersH} className="text-blue-700 text-base" />
              </button>
            )}

            {/* Results area */}
            {!debouncedQuery && !showDropdown && <SearchPrompt />}
            {/* Skeleton only on initial load (no data yet) — not on background refetches */}
            {isLoading && debouncedQuery && (
              <SearchSkeletons tab={activeTab} viewMode={viewMode} />
            )}
            {isError && !isFetching && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 text-xl">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <p className="font-bold text-gray-800">Search failed</p>
                <p className="text-sm text-gray-400">
                  Please check your connection and try again.
                </p>
              </div>
            )}
            {!isLoading && debouncedQuery && data && !hasResults && (
              <NoResults query={debouncedQuery} />
            )}
            {data && hasResults && (
              <>
                {activeTab === "vaults" && (
                  <VaultResults
                    items={data.vaults}
                    total={data.vaultsTotal}
                    viewMode={viewMode}
                    filters={vaultFilters}
                    onOpen={(id) => {
                      setRecent(addRecent(debouncedQuery));
                      navigate(`/vault/${id}`);
                    }}
                  />
                )}
                {activeTab === "people" && (
                  <PeopleResults
                    items={data.users}
                    total={data.usersTotal}
                    filters={peopleFilters}
                    onOpen={(id) => {
                      setRecent(addRecent(debouncedQuery));
                      navigate(ROUTES.USER.PUBLIC_PROFILE_PATH(id));
                    }}
                  />
                )}
                {activeTab === "places" && (
                  <PlacesResults
                    items={data.locations}
                    total={data.locationsTotal}
                    filters={placesFilters}
                    query={debouncedQuery}
                  />
                )}
              </>
            )}
          </main>

          {/* Mobile Filters Modal */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto animate-[slideTop_0.2s_ease-out]">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="p-4 flex-1">
                <FilterPanel
                  activeTab={activeTab}
                  vaultFilters={vaultFilters}
                  setVaultFilters={setVaultFilters}
                  peopleFilters={peopleFilters}
                  setPeopleFilters={setPeopleFilters}
                  placesFilters={placesFilters}
                  setPlacesFilters={setPlacesFilters}
                  filtersOpen={true}
                  setFiltersOpen={() => {}}
                  DEFAULT_VAULT_FILTERS={DEFAULT_VAULT_FILTERS}
                  DEFAULT_PEOPLE_FILTERS={DEFAULT_PEOPLE_FILTERS}
                  DEFAULT_PLACES_FILTERS={DEFAULT_PLACES_FILTERS}
                />
              </div>
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md"
                  style={{ background: BRAND_GRAD_R }}
                >
                  Show Results
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
