import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// Route through Vite dev proxy (/nominatim → nominatim.openstreetmap.org)
// Nominatim requires a User-Agent header that browsers cannot set directly.
// The Vite proxy injects it server-side (see vite.config.ts).
const NOMINATIM_URL = "/nominatim/search";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationResult {
  placeId: number;
  name: string;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  selected: LocationResult | null;
  onSelect: (loc: LocationResult) => void;
  onClear: () => void;
}

const LocationSearch = ({
  selected,
  onSelect,
  onClear,
}: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: "json",
        limit: "6",
        addressdetails: "1",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { "Accept-Language": "en" },
      });
      const data: NominatimResult[] = await res.json();
      setResults(
        data.map((d) => ({
          placeId: d.place_id,
          name: d.display_name,
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const pick = (loc: LocationResult) => {
    onSelect(loc);
    setQuery("");
    setResults([]);
  };

  if (selected) {
    return (
      <div className="space-y-3">
        {/* Selected chip */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-md">
          <FontAwesomeIcon
            icon={faMapLocationDot}
            className="text-blue-500 shrink-0 text-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {selected.name.split(",")[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {selected.name.split(",").slice(1, 3).join(",").trim()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Embedded OSM map */}
        <div className="rounded-md overflow-hidden border border-gray-200">
          <iframe
            title="location-map"
            width="100%"
            height="200"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lon - 0.05},${selected.lat - 0.05},${selected.lon + 0.05},${selected.lat + 0.05}&layer=mapnik&marker=${selected.lat},${selected.lon}`}
            style={{ border: 0, display: "block" }}
          />
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex justify-end">
            <a
              href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lon}#map=14/${selected.lat}/${selected.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Open full map ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center border border-gray-300 rounded-md focus-within:ring focus-within:ring-blue-700 transition-all duration-300 ease-in-out overflow-hidden">
        {searchLoading ? (
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-gray-400 text-xs ml-3 shrink-0"
          />
        ) : (
          <FontAwesomeIcon
            icon={faMapLocationDot}
            className="text-gray-400 text-xs ml-3 shrink-0"
          />
        )}
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search a place you visited…"
          className="flex-1 px-2 py-3 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute inset-x-0 top-full mt-1 z-50 bg-white rounded-md border border-gray-200 shadow-lg overflow-hidden animate-[slideTop_0.15s_ease-out]">
          {results.map((r) => (
            <button
              key={r.placeId}
              type="button"
              onClick={() => pick(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left cursor-pointer border-b border-gray-100 last:border-0"
            >
              <FontAwesomeIcon
                icon={faMapLocationDot}
                className="text-blue-400 text-xs mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {r.name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {r.name.split(",").slice(1, 3).join(",").trim()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
