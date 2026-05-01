import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarDays,
  faSpinner,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";
import { userQueries } from "../../../../tanstack/user/queries";

// ── helpers ──────────────────────────────────────────────────────────────────

function calcGrowthPct(
  data: { year: number; visits: number }[],
): number | null {
  if (data.length < 2) return null;
  const prev = data[data.length - 2].visits;
  const curr = data[data.length - 1].visits;
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ── Component ─────────────────────────────────────────────────────────────────

const ProfileVisitsPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { getProfileVisitStats } = userQueries();
  const { data, isLoading, isError } = useQuery(getProfileVisitStats());

  const yearlyData = data?.yearlyData ?? [];
  const totalVisits = data?.totalVisits ?? 0;
  const last30Days = data?.last30Days ?? 0;
  const maxVisits = yearlyData.length
    ? Math.max(...yearlyData.map((d) => d.visits))
    : 1;
  const growthPct = calcGrowthPct(yearlyData);
  const latestYear = yearlyData.at(-1)?.year;

  // ── skeleton / error ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent animate-[slideDown_0.3s_ease-out]">
        <MobileStickyHeader title="Profile Visits" />
        <div className="p-4 md:p-0 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm animate-pulse h-24"
              />
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-pulse h-64" />
          <div className="bg-indigo-600/50 rounded-lg p-5 h-20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-transparent animate-[slideDown_0.3s_ease-out]">
        <MobileStickyHeader title="Profile Visits" />
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartBar} className="text-xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm">
            Could not load visit data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Profile Visits" />

      {/* Desktop header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Profile Visits</h2>
        <p className="text-xs text-gray-400">
          Number of unique travelers who viewed your profile
        </p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {/* ── Summary row ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total visits */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover-lift transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Total Visits
            </p>
            <p className="text-xl font-bold text-indigo-600">
              {totalVisits.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              all-time discovery
            </p>
          </div>

          {/* Growth / Last 30 days */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover-lift transition-all duration-300">
            {growthPct !== null ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  YoY Growth
                </p>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={growthPct >= 0 ? faArrowTrendUp : faArrowTrendDown}
                    className={growthPct >= 0 ? "text-emerald-500" : "text-rose-500"}
                  />
                  <p
                    className={`text-xl font-bold ${
                      growthPct >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {growthPct >= 0 ? "+" : ""}
                    {growthPct}%
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  vs {latestYear ? latestYear - 1 : "last year"}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Last 30 Days
                </p>
                <p className="text-xl font-bold text-indigo-600">
                  {last30Days.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  recent visitors
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover-lift transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Growth Timeline
              </h3>
            </div>
            {yearlyData.length > 0 && (
              <span className="px-2 py-1 bg-gray-50 rounded-md text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {yearlyData[0].year} — {yearlyData.at(-1)!.year}
              </span>
            )}
          </div>

          {yearlyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <FontAwesomeIcon icon={faUsers} className="text-3xl text-gray-200" />
              <p className="text-sm text-gray-400 font-semibold">
                No visits recorded yet.
              </p>
              <p className="text-xs text-gray-300">
                Share your profile to start getting visitors!
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48 md:h-56 px-2 border-b border-gray-100">
              {yearlyData.map((item, idx) => {
                const heightPct = (item.visits / maxVisits) * 100;
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={item.year}
                    className="flex-1 flex flex-col items-center h-full group py-2 cursor-pointer"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="relative w-full flex-1 flex items-end justify-center mb-3">
                      {/* Tooltip */}
                      <div
                        className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-xl transition-all duration-200 z-10 bg-indigo-600 ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 pointer-events-none"
                        }`}
                      >
                        {item.visits.toLocaleString()}
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full max-w-[20px] rounded-t-lg transition-all duration-300 ease-out"
                        style={{
                          height: `${Math.max(heightPct, 4)}%`,
                          backgroundColor: isActive ? "#4f46e5" : "#e0e7ff",
                        }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[10px] font-bold transition-colors shrink-0 ${
                        isActive ? "text-indigo-600" : "text-gray-400"
                      }`}
                    >
                      {String(item.year).slice(-2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Insight box ── */}
        <div className="bg-indigo-600 rounded-lg p-5 text-white relative overflow-hidden hover-lift transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon icon={faUsers} size="3x" />
          </div>
          <div className="relative z-10">
            <h4 className="text-base font-bold mb-1">Audience Insight</h4>
            {totalVisits === 0 ? (
              <p className="text-indigo-100 text-[11px] leading-relaxed max-w-sm">
                No visits yet — share your profile link to get discovered by
                fellow travelers.
              </p>
            ) : (
              <p className="text-indigo-100 text-[11px] leading-relaxed max-w-sm">
                Your profile has been viewed{" "}
                <span className="text-white font-bold">
                  {totalVisits.toLocaleString()}
                </span>{" "}
                times in total.
                {last30Days > 0 && (
                  <>
                    {" "}
                    <span className="text-white font-bold">
                      {last30Days.toLocaleString()}
                    </span>{" "}
                    of those were in the last 30 days.
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisitsPage;
