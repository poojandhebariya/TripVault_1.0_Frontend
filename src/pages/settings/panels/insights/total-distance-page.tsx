import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faEarthAmericas,
  faGlobeAsia,
  faGlobeEurope,
  faFlagCheckered,
  faGlobeAfrica,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";
import { userQueries } from "../../../../tanstack/user/queries";

// ── Continent config ─────────────────────────────────────────────────────────
const CONTINENT_CONFIG: Record<
  string,
  { icon: typeof faGlobeAsia; bg: string; text: string }
> = {
  Asia:     { icon: faGlobeAsia,    bg: "bg-orange-50",  text: "text-orange-600" },
  Europe:   { icon: faGlobeEurope,  bg: "bg-blue-50",    text: "text-blue-600" },
  Americas: { icon: faEarthAmericas,bg: "bg-emerald-50", text: "text-emerald-600" },
  Africa:   { icon: faGlobeAfrica,  bg: "bg-red-50",     text: "text-red-600" },
  Oceania:  { icon: faRoute,        bg: "bg-purple-50",  text: "text-purple-600" },
  Other:    { icon: faMapPin,       bg: "bg-gray-50",    text: "text-gray-500" },
};

// ── Milestone name map ────────────────────────────────────────────────────────
const MILESTONE_NAMES: Record<number, string> = {
  1000:   "First 1,000 km",
  5000:   "5K Explorer",
  10000:  "10K Adventurer",
  20000:  "Half-Earth Challenge",
  40075:  "Around the World",
  80150:  "Double Circumnavigation",
  160300: "Legendary Voyager",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

const TotalDistancePage = () => {
  const { getDistanceStats } = userQueries();
  const { data, isLoading } = useQuery(getDistanceStats());

  const totalKm     = data?.totalKm ?? 0;
  const earthRatio  = data?.earthRatio ?? 0;
  const remaining   = data?.remainingKm ?? 0;
  const milestone   = data?.nextMilestoneKm ?? 0;
  const continents  = data?.continents ?? [];
  const monthly     = data?.monthly ?? [];

  const maxMonthly  = Math.max(...monthly.map((m) => m.vaults), 1);

  // ── Milestone progress ─────────────────────────────────────────────────────
  const prevMilestone = milestone === 1000 ? 0
    : [1000, 5000, 10000, 20000, 40075, 80150][
        [1000, 5000, 10000, 20000, 40075, 80150, 160300].indexOf(milestone) - 1
      ] ?? 0;
  const progressPct = milestone > prevMilestone
    ? Math.min(100, Math.round(((totalKm - prevMilestone) / (milestone - prevMilestone)) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Total Distance" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Journey Metrics</h2>
        <p className="text-xs text-gray-400">Total distance covered across your vaulted journeys</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">

        {/* ── Hero Card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
            <FontAwesomeIcon icon={faRoute} size="4x" />
          </div>

          <div className="relative z-10 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">
              Cumulative Journey
            </p>

            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse mx-auto" />
                <div className="h-6 w-48 bg-gray-50 rounded-full animate-pulse mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-indigo-600 mb-4">
                  {totalKm.toLocaleString(undefined, { maximumFractionDigits: 1 })}{" "}
                  <span className="text-lg">km</span>
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                  <FontAwesomeIcon icon={faEarthAmericas} className="animate-pulse" />
                  {earthRatio}x around the Earth
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Continent Breakdown ─────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : continents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continents.map(({ continent, vaults }) => {
              const cfg = CONTINENT_CONFIG[continent] ?? CONTINENT_CONFIG["Other"];
              return (
                <div key={continent} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={cfg.icon} className="text-base" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                      {continent}
                    </p>
                    <p className="text-base font-bold text-gray-800">
                      {vaults}{" "}
                      <span className="text-[10px] font-medium text-gray-400 ml-1">
                        {vaults === 1 ? "vault" : "vaults"}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm text-center text-sm text-gray-400">
              No continent data yet — publish vaults with locations to see breakdown.
            </div>
          )
        )}

        {/* ── Activity Timeline ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
              Vault Activity
            </h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Last 6 Months
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-40 md:h-52 px-2 border-b border-gray-100">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full py-2">
                    <div className="relative w-full flex-1 flex items-end justify-center mb-3">
                      <div
                        className="w-full max-w-[18px] md:max-w-[28px] rounded-t-[2px] bg-gray-100 animate-pulse"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                      />
                    </div>
                    <div className="h-2 w-6 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))
              : monthly.map(({ month, vaults }) => {
                  const h = (vaults / maxMonthly) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center h-full group py-2">
                      <div className="relative w-full flex-1 flex items-end justify-center mb-3">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-[#1e1b4b] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-lg whitespace-nowrap">
                          {vaults} {vaults === 1 ? "vault" : "vaults"}
                        </div>
                        <div
                          className="w-full max-w-[18px] md:max-w-[28px] rounded-t-[2px] bg-indigo-100 group-hover:bg-indigo-600 transition-all duration-200 ease-out"
                          style={{ height: `${Math.max(h, 4)}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                        {month}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* ── Milestone Card ──────────────────────────────────────────── */}
        <div className="bg-slate-900 rounded-lg p-5 text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon icon={faFlagCheckered} size="2x" />
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/10 backdrop-blur-sm">
            🚀
          </div>
          <div className="text-center md:text-left flex-1">
            <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">
              Next Milestone
            </p>
            {isLoading ? (
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-56 bg-white/10 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-base font-bold mb-0.5">
                  {MILESTONE_NAMES[milestone] ?? `${fmt(milestone)} km Challenge`}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Travel{" "}
                  <span className="text-white font-bold">
                    {remaining.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                  </span>{" "}
                  more to reach this badge.
                </p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-white/10 rounded-full w-full max-w-xs">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">{progressPct}% complete</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TotalDistancePage;
