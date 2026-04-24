import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faHashtag,
  faChevronRight,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import type { SearchItemLocation, PlacesFilters } from "../../types/search";
import type { CountryIndex } from "../../types/explore";
import type { Place } from "../../types/explore";
import { BRAND_GRAD, fmtNum } from "./search-utils";
import { SectionHeader } from "./vault-results";
import { COUNTRIES_INDEX } from "../../data/countries-index";
import { fetchCountryData } from "../../utils/country-data-cache";

// ── Fuzzy match score ──────────────────────────────────────────────────────────
// Returns a score > 0 if the country matches the query, 0 if not.
// Higher score = better match.
function countryScore(country: CountryIndex, query: string): number {
  const q = query.toLowerCase().trim();
  const name = country.name.toLowerCase();
  const code = country.code.toLowerCase();

  if (!q) return 0;
  if (name === q || code === q) return 100; // exact
  if (name.startsWith(q)) return 80;        // prefix
  if (name.includes(q)) return 60;          // contains
  if (code.startsWith(q)) return 50;        // code prefix

  // Word-level: any word in the name starts with query
  const words = name.split(/[\s-]+/);
  if (words.some((w) => w.startsWith(q))) return 40;

  // Subsequence: all chars of query appear in order in name (typo-tolerant)
  let qi = 0;
  for (let i = 0; i < name.length && qi < q.length; i++) {
    if (name[i] === q[qi]) qi++;
  }
  if (qi === q.length && q.length >= 3) return 20;

  return 0;
}

interface PlacesResultsProps {
  items: SearchItemLocation[];
  total: number;
  filters: PlacesFilters;
  query: string;
}

const PlacesResults = ({ items, total, filters: _filters, query }: PlacesResultsProps) => {
  const navigate = useNavigate();

  // Navigate to the best matching place detail, falling back to country → explore
  const navigateToLocation = async (label: string) => {
    const parts = label.split(",").map((s) => s.trim());
    const placeName = parts[0];
    const countryPart = parts[parts.length - 1];

    const countryMatch = COUNTRIES_INDEX.find(
      (c) => c.name.toLowerCase() === countryPart.toLowerCase()
    );

    if (countryMatch) {
      const countryData = await fetchCountryData(countryMatch.code);
      if (countryData) {
        // Fuzzy place match: name or location contains the place part
        const placeMatch = countryData.places.find(
          (p: Place) =>
            p.name.toLowerCase().includes(placeName.toLowerCase()) ||
            p.location.toLowerCase().includes(placeName.toLowerCase())
        );
        if (placeMatch) {
          navigate(`/explore/place/${placeMatch.id}`);
          return;
        }
      }
      // Fallback: go to country detail
      navigate(`/explore/country/${countryMatch.code.toLowerCase()}`);
      return;
    }

    // Last resort: explore page
    navigate("/explore");
  };

  // Fuzzy-matched countries from local COUNTRIES_INDEX
  const matchedCountries = useMemo(() => {
    if (!query || query.length < 2) return [];
    return COUNTRIES_INDEX
      .map((c) => ({ country: c, score: countryScore(c, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ country }) => country);
  }, [query]);

  const hasLocations = items.length > 0;
  const hasCountries = matchedCountries.length > 0;

  if (!hasLocations && !hasCountries) {
    return (
      <p className="py-10 text-center text-[13px] text-gray-400">
        No destinations matched your search.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Country matches from Explore ───────────────────────────────────── */}
      {hasCountries && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faGlobe} className="text-blue-600 text-xs" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Countries
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedCountries.map((c) => (
              <button
                key={c.code}
                onClick={() => navigate(`/explore/country/${c.code.toLowerCase()}`)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 text-left hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-pointer group"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                {/* Emoji flag */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl bg-gray-50 border border-gray-100">
                  {c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                    <FontAwesomeIcon icon={faLocationDot} className="text-[10px]" />
                    {c.places_count} places · {c.continent}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-200 group-hover:text-blue-400 transition-colors text-sm flex-shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Vault-based location matches from backend ──────────────────────── */}
      {hasLocations && (
        <div>
          <SectionHeader label="Places" total={total} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((loc) => (
              <button
                key={loc.label}
                onClick={() => navigateToLocation(loc.label)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 text-left hover:shadow-md hover:-translate-y-px transition-all duration-200 cursor-pointer group"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ background: BRAND_GRAD }}
                >
                  <FontAwesomeIcon icon={faLocationDot} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    {loc.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <FontAwesomeIcon icon={faHashtag} className="text-[10px]" />
                    {fmtNum(loc.vaultCount)} vault{loc.vaultCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-200 group-hover:text-blue-400 transition-colors text-sm flex-shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacesResults;
