import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { COUNTRIES_INDEX } from "../../data/countries-index";
import { PlaceCard } from "../../components/explore/place-card";
import { TYPE_THEME, TYPE_ICONS, DEFAULT_TYPE_THEME } from "../../data/explore/theme";
import { type Place } from "../../types/explore";
import Input from "../../components/ui/input";
import { PLACE_TYPES } from "../../data/explore/constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CountryDetail {
  code: string;
  name: string;
  emoji: string;
  continent: string;
  gradient: string;
  tagline: string;
  places: Place[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

const CountryDetailView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [countryDetail, setCountryDetail] =
    React.useState<CountryDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [flagError, setFlagError] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchCountry = async () => {
      if (!code) return;
      setLoading(true);
      try {
        setFetchError(null);
        const resp = await fetch(`/data/countries/${code.toUpperCase()}.json`);
        if (resp.ok) {
          setCountryDetail(await resp.json());
        } else {
          setFetchError(`HTTP Error: ${resp.status} ${resp.statusText}`);
          console.error(`Failed with status: ${resp.status}`);
        }
      } catch (err) {
        console.error("Failed to load country:", err);
        setFetchError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [code]);

  const meta = React.useMemo(
    () => COUNTRIES_INDEX.find((c) => c.code === code?.toUpperCase()),
    [code],
  );
  const flagUrl = meta
    ? `https://flagcdn.com/w160/${meta.code.toLowerCase()}.png`
    : "";

  const filteredPlaces = React.useMemo(() => {
    if (!countryDetail) return [];
    const q = searchQuery.trim().toLowerCase();
    return countryDetail.places.filter((p: Place) => {
      const matchesType = selectedType ? p.type === selectedType : true;
      const matchesSearch = q
        ? p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        : true;
      return matchesType && matchesSearch;
    });
  }, [countryDetail, selectedType, searchQuery]);

  if (loading) {
    return (
      <div className="h-full bg-white font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-[10px] font-semibold animate-pulse tracking-[0.4em] uppercase">
            Loading destinations…
          </p>
        </div>
      </div>
    );
  }

  if (!countryDetail || !meta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-500 font-medium">Country not found.</p>
        {fetchError && (
          <p className="text-red-500 text-xs bg-red-50 px-4 py-2 rounded-md max-w-md text-center">
            Error details: {fetchError}
          </p>
        )}
        <button
          onClick={() => navigate("/explore")}
          className="text-indigo-600 underline text-sm font-semibold"
        >
          Go back to explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50/50 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-50/50 rounded-full blur-[80px]" />
        </div>

        {/* Decorative country-code watermark */}
        <div className="absolute right-10 bottom-0 pointer-events-none select-none hidden lg:block">
          <span className="text-[12rem] font-extrabold text-indigo-100/80 leading-none uppercase tracking-tighter opacity-70">
            {meta.code}
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
            {/* Flag */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 shrink-0 bg-white border-4 border-white">
              {!flagError ? (
                <img
                  src={flagUrl}
                  alt={`${meta.name} flag`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  onError={() => setFlagError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {meta.emoji}
                </div>
              )}
            </div>

            {/* Title + search */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-xl border border-indigo-100/50">
                  {countryDetail.continent}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Global Asset
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-none mb-3 uppercase drop-shadow-sm">
                {countryDetail.name}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-6">
                Syncing {countryDetail.places.length} premium destinations
              </p>

              {/* ── SEARCH inside hero ── */}
              <div className="relative max-w-xl">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none z-10"
                />
                <Input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${countryDetail.places.length} places in ${countryDetail.name}…`}
                  className="w-full pl-11 pr-10 py-3.5 text-sm font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-gray-400 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="text-gray-600 text-xs"
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-10 shrink-0 pr-4">
              <div className="flex flex-col items-center">
                <p className="text-4xl font-extrabold text-indigo-600 tracking-tighter leading-none mb-2">
                  {countryDetail.places.length}
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Places
                </p>
              </div>
              <div className="w-px h-12 bg-indigo-100/50" />
              <div className="flex flex-col items-center">
                <p className="text-4xl font-extrabold text-amber-500 tracking-tighter leading-none mb-2">
                  4.8
                </p>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                  Score
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY FILTER CHIPS ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 md:py-4 no-scrollbar">
            <button
              onClick={() => setSelectedType(null)}
              className={`shrink-0 cursor-pointer px-3 md:px-5 py-2 md:py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border ${
                !selectedType
                  ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200"
                  : "bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              All ({countryDetail.places.length})
            </button>
            {PLACE_TYPES.filter((t) =>
              countryDetail.places.some((p) => p.type === t),
            ).map((t) => {
              const count = countryDetail.places.filter(
                (p) => p.type === t,
              ).length;
              const isSelected = selectedType === t;
              const theme = TYPE_THEME[t] || DEFAULT_TYPE_THEME;

              return (
                <button
                  key={t}
                  onClick={() => setSelectedType(isSelected ? null : t)}
                  className={`shrink-0 cursor-pointer flex items-center gap-2.5 px-3 md:px-5 py-2 md:py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border ${
                    isSelected
                      ? `${theme.bg} ${theme.text} ${theme.border} shadow-lg shadow-indigo-500/10`
                      : "bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={TYPE_ICONS[t]}
                    className={`text-[10px] ${isSelected ? theme.text : "opacity-30"}`}
                  />
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PLACES GRID ── */}
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Results count indicator */}
        {(searchQuery || selectedType) && filteredPlaces.length > 0 && (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            {filteredPlaces.length} result
            {filteredPlaces.length !== 1 ? "s" : ""}
            {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
            {selectedType && <span> in {selectedType}</span>}
          </p>
        )}

        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPlaces.map((p: Place) => (
              <PlaceCard
                key={p.id}
                place={p}
                onClick={() => navigate(`/explore/place/${p.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faFilter}
                className="text-2xl text-gray-300"
              />
            </div>
            <p className="text-gray-500 font-semibold text-sm">
              {searchQuery
                ? `No places found for "${searchQuery}"`
                : "No places found for this category."}
            </p>
            <button
              onClick={() => {
                setSelectedType(null);
                setSearchQuery("");
              }}
              className="text-indigo-600 text-xs font-bold underline cursor-pointer"
            >
              View all places
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryDetailView;
