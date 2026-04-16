import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faXmark,
  faGlobe,
  faEarthAmericas,
} from "@fortawesome/free-solid-svg-icons";
import { COUNTRIES_INDEX } from "../../data/countries-index";
import { type CountryIndex } from "../../types/explore";
import { CountryCard } from "../../components/explore/country-card";
import { CONTINENTS, COUNTRY_PALETTES } from "../../data/explore/constants";

// ─── Main Explore Component ───────────────────────────────────────────────────
const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedContinent, setSelectedContinent] = React.useState("All");
  const [visibleCount, setVisibleCount] = React.useState(24);

  const filteredCountries = React.useMemo(() => {
    let list = COUNTRIES_INDEX;
    if (selectedContinent !== "All")
      list = list.filter((c) => c.continent === selectedContinent);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedContinent, searchQuery]);

  const getCountryPalette = (code: string, index: number): string => {
    const charSum = code.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return COUNTRY_PALETTES[(index + charSum) % COUNTRY_PALETTES.length];
  };

  const visibleCountriesList = React.useMemo(
    () => filteredCountries.slice(0, visibleCount),
    [filteredCountries, visibleCount],
  );

  React.useEffect(() => {
    setVisibleCount(24);
  }, [selectedContinent, searchQuery]);

  return (
    <div className="min-h-screen font-sans bg-gray-50/50 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── INTEGRATED MESH HERO (FULL-WIDTH BACKGROUND) ── */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Full-Width Mesh Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-50/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 w-64 h-48 bg-cyan-50/20 rounded-full blur-[60px]" />
        </div>

        {/* Content Centered in Max-Width */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 relative">
          {/* Subtle Watermark integrated with margin (Visible on mobile) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-8xl md:text-[18rem] font-black text-indigo-100/60 leading-none uppercase tracking-tighter opacity-70 whitespace-nowrap">
              Explore
            </span>
          </div>

          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-10">
              <div className="flex-1">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-3">
                  Explore the{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-violet-500 to-cyan-500">
                    World
                  </span>
                </h1>
                <p className="text-gray-500 text-base max-w-md">
                  Discover {COUNTRIES_INDEX.length} countries and 15,000+
                  hand-picked destinations across every continent.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-3 md:px-5 py-2 md:py-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {COUNTRIES_INDEX.length}
                  </p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    Countries
                  </p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-3 md:px-5 py-2 md:py-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">
                    15K+
                  </p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    Places
                  </p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-3 md:px-5 py-2 md:py-3 text-center">
                  <p className="text-xl md:text-2xl font-bold text-emerald-500">
                    6
                  </p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    Continents
                  </p>
                </div>
              </div>
            </div>

            <div className="relative max-w-lg shadow-sm rounded-xl">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
              />
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-10 py-3.5 text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                placeholder="Search countries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 md:py-4 no-scrollbar">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedContinent(c)}
                className={`shrink-0 cursor-pointer px-3 md:px-5 py-2 md:py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border ${
                  selectedContinent === c
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                    : "bg-white text-gray-400 border-gray-100 hover:text-indigo-600 hover:border-indigo-300"
                }`}
              >
                {c}
              </button>
            ))}
            <div className="ml-auto pl-4 border-l border-gray-200 shrink-0 flex items-center gap-1.5">
              <FontAwesomeIcon
                icon={faEarthAmericas}
                className="text-gray-300 text-xs"
              />
              <span className="text-gray-400 text-[11px] font-bold whitespace-nowrap">
                {filteredCountries.length} countries
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredCountries.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {visibleCountriesList.map((c: CountryIndex, idx: number) => (
                <CountryCard
                  key={c.code}
                  country={c}
                  palette={getCountryPalette(c.code, idx)}
                  onClick={() =>
                    navigate(`/explore/country/${c.code.toLowerCase()}`)
                  }
                />
              ))}
            </div>

            {visibleCount < filteredCountries.length && (
              <div className="flex flex-col items-center gap-3 mt-10">
                <button
                  onClick={() => setVisibleCount((p) => p + 24)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all cursor-pointer"
                >
                  Load More Countries
                </button>
                <span className="text-gray-400 text-xs font-semibold">
                  Showing {Math.min(visibleCount, filteredCountries.length)} of{" "}
                  {filteredCountries.length}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="py-32 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-xl text-gray-300"
              />
            </div>
            <p className="text-gray-500 font-semibold text-sm">
              No countries found.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedContinent("All");
              }}
              className="text-indigo-600 text-xs font-bold underline cursor-pointer p-1"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
