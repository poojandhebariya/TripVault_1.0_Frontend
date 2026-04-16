import {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import type { Place } from "../../types/explore";
import ShimmeringGrid from "../../components/lightswind/shimmering-grid";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { type NominatimResult, type LocationResult } from "../../types/location";

const NOMINATIM_URL = "/nominatim/search";

const POPULAR = [
  { name: "Paris", emoji: "🗼", country: "France" },
  { name: "Tokyo", emoji: "⛩️", country: "Japan" },
  { name: "Bali", emoji: "🌴", country: "Indonesia" },
  { name: "Rome", emoji: "🏛️", country: "Italy" },
  { name: "New York", emoji: "🗽", country: "USA" },
  { name: "Dubai", emoji: "🌆", country: "UAE" },
  { name: "London", emoji: "💂", country: "UK" },
  { name: "Sydney", emoji: "🦘", country: "Australia" },
];

const TRENDING = [
  {
    dest: "Kyoto",
    title: "Kyoto cultural immersion",
    meta: "7 days · Japan · Temples, gardens & cuisine",
    tag: "Trending",
  },
  {
    dest: "Amalfi Coast",
    title: "Amalfi Coast road trip",
    meta: "5 days · Italy · Coastal drives & seafood",
    tag: "Popular",
  },
  {
    dest: "Marrakech",
    title: "Marrakech medina explorer",
    meta: "4 days · Morocco · Souks, riads & spices",
    tag: "Unique",
  },
  {
    dest: "Santorini",
    title: "Santorini cliffside escape",
    meta: "6 days · Greece · Sunsets, beaches & wine",
    tag: "Trending",
  },
  {
    dest: "Reykjavik",
    title: "Icelandic nature quest",
    meta: "8 days · Iceland · Glaciers & waterfalls",
    tag: "Adventure",
  },
  {
    dest: "Cape Town",
    title: "Cape Town coastal adventure",
    meta: "7 days · South Africa · Table Mountain & wine",
    tag: "Popular",
  },
];

function buildPlace(d: NominatimResult, overrideName?: string): Place {
  return {
    id: String(d.place_id),
    name: overrideName ?? d.display_name.split(",")[0].trim(),
    location: d.display_name.split(",").slice(1, 3).join(",").trim(),
    country: d.address?.country ?? "",
    countryCode: (d.address?.country_code ?? "").toUpperCase(),
    type: d.type ?? d.class ?? "place",
    tags: [],
    rating: 0,
    reviewCount: 0,
    gradient: "from-indigo-500 to-purple-600",
    emoji: "🗺️",
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lon),
  };
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    className="text-gray-400 shrink-0"
  >
    <circle cx="6.5" cy="6.5" r="4" />
    <line x1="9.5" y1="9.5" x2="14" y2="14" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    className="text-gray-400 shrink-0"
  >
    <line x1="3" y1="8" x2="13" y2="8" />
    <polyline points="9,4 13,8 9,12" />
  </svg>
);

const PlanSearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [popularLoading, setPopularLoading] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
          shortName: d.display_name.split(",")[0].trim(),
          country: d.address?.country ?? "",
          countryCode: (d.address?.country_code ?? "").toUpperCase(),
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          type: d.type ?? d.class ?? "place",
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
    debounceRef.current = setTimeout(() => search(val), 380);
  };

  const goToTrip = (place: Place) =>
    navigate(ROUTES.PLAN_TRIP, { state: { place } });

  const handleSelect = (r: LocationResult) => {
    goToTrip(
      buildPlace({
        place_id: r.placeId,
        display_name: r.name,
        lat: String(r.lat),
        lon: String(r.lon),
        type: r.type,
        address: {
          country: r.country,
          country_code: r.countryCode.toLowerCase(),
        },
      }),
    );
  };

  const handlePopular = async (dest: (typeof POPULAR)[0]) => {
    setPopularLoading(dest.name);
    try {
      const params = new URLSearchParams({
        q: dest.name,
        format: "json",
        limit: "1",
        addressdetails: "1",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { "Accept-Language": "en" },
      });
      const data: NominatimResult[] = await res.json();
      if (data.length > 0) {
        const place = buildPlace(data[0], dest.name);
        place.emoji = dest.emoji;
        goToTrip(place);
      }
    } catch {
      /* silent */
    } finally {
      setPopularLoading(null);
    }
  };

  const pickDest = (name: string) => {
    setQuery(name);
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const secondary = (n: string) => n.split(",").slice(1, 3).join(",").trim();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative flex items-center justify-center h-[65vh] md:h-[78vh]"
      >
        {/* ── Shimmering Grid Background ── */}
        <ShimmeringGrid />

        {/* ── Centered content ─────────────────────────────────────────────── */}
        <div className="relative z-[20] w-full max-w-2xl mx-auto text-center bg-white">
          {/* Headline */}
          <h1 className="text-[1.8rem] font-black leading-[1.1] tracking-[-0.04em] text-gray-900 sm:text-4xl lg:text-[3.5rem]">
            Plan your trip,
          </h1>
          <h1 className="mb-6 text-[1.8rem] font-black leading-[1.1] tracking-[-0.04em] sm:text-4xl lg:text-[3.5rem]">
            <span className="gradient-text">in seconds.</span>
          </h1>

          {/* Sub */}
          <p className="mb-9 text-[0.95rem] sm:text-[1.05rem] leading-relaxed text-gray-500 max-w-sm md:max-w-md mx-auto px-4">
            Search any destination — our AI builds a personalised itinerary with
            daily activities, tips &amp; local budget.
          </p>

          {/* Search bar */}
          <div className="relative mx-auto max-w-[540px] px-5 md:px-0">
            <div className="absolute top-1/2 left-8 md:left-4 -translate-y-1/2">
              <SearchIcon />
            </div>
            <Input
              autoFocus
              value={query}
              onChange={handleChange}
              placeholder="Where are you headed?"
              className="pl-10 pr-28"
            />
            {searchLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent shrink-0 absolute top-1/2 right-12 -translate-y-1/2" />
            ) : (
              <Button
                onClick={() => query.trim() && search(query)}
                className="w-fit py-1 px-3 absolute top-1/2 right-8 md:right-4 -translate-y-1/2 rounded-md"
                text="Plan Trip"
              />
            )}

            {/* Dropdown */}
            {results.length > 0 && (
              <div
                className="absolute left-5 right-5 md:left-0 md:right-0 top-full z-50 overflow-hidden rounded-lg border border-gray-100 bg-white"
                style={{
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                {results.map((r, i) => (
                  <button
                    key={r.placeId}
                    type="button"
                    onClick={() => handleSelect(r)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-indigo-50/50 cursor-pointer ${i !== results.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-gray-900">
                        {r.shortName}
                      </p>
                      {secondary(r.name) && (
                        <p className="truncate text-xs text-gray-400">
                          {secondary(r.name)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* Popular destinations */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
            Popular destinations
          </span>
          <span className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700">
            See all
          </span>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {POPULAR.map((dest) => {
            const isPending = popularLoading === dest.name;
            return (
              <button
                key={dest.name}
                type="button"
                onClick={() => handlePopular(dest)}
                disabled={!!popularLoading}
                className="group flex flex-col items-start gap-2 rounded-xl border border-gray-100 bg-white p-3 sm:p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/10 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gray-50 text-base sm:text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    dest.emoji
                  )}
                </div>
                <div>
                  <p className="text-[12px] sm:text-[13px] font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {dest.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">
                    {dest.country}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trending trips */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
            Trending trips
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRENDING.map((trip, i) => (
            <button
              key={trip.dest}
              type="button"
              onClick={() => pickDest(trip.dest)}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left transition-all hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[11px] font-medium text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1 relative z-10">
                <p className="text-[13px] font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {trip.title}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">{trip.meta}</p>
              </div>
              {trip.tag && (
                <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-700 relative z-10">
                  {trip.tag}
                </span>
              )}
              <div className="group-hover:translate-x-1 transition-transform relative z-10">
                <ArrowIcon />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSearchPage;
