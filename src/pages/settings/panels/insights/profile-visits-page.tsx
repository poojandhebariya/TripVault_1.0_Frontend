import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faArrowTrendUp, faArrowLeft, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";

const YEARLY_DATA = [
  { year: "2020", visits: 214 },
  { year: "2021", visits: 389 },
  { year: "2022", visits: 576 },
  { year: "2023", visits: 843 },
  { year: "2024", visits: 1102 },
  { year: "2025", visits: 1248 },
];

const TOTAL_VISITS = YEARLY_DATA.reduce((sum, d) => sum + d.visits, 0);
const MAX_VISITS = Math.max(...YEARLY_DATA.map((d) => d.visits));
const GROWTH_PCT = Math.round(
  ((YEARLY_DATA.at(-1)!.visits - YEARLY_DATA.at(-2)!.visits) /
    YEARLY_DATA.at(-2)!.visits) *
    100
);

const ProfileVisitsPage = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Profile Visits" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Profile Visits</h2>
        <p className="text-xs text-gray-400">Detailed breakdown of viewer engagement</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Visits</p>
            <p className="text-xl font-bold text-blue-600">{TOTAL_VISITS.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">all-time discovery</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">YoY Growth</p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-emerald-500" />
              <p className="text-xl font-bold text-emerald-600">+{GROWTH_PCT}%</p>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">vs last year</p>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Growth Timeline</h3>
            </div>
            <span className="px-2 py-1 bg-gray-50 rounded-md text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              2020 — 2025
            </span>
          </div>

          <div className="flex items-end gap-2 h-48 md:h-56 px-2 border-b border-gray-100">
            {YEARLY_DATA.map((item, idx) => {
              const heightPct = (item.visits / MAX_VISITS) * 100;
              const isActive = activeIndex === idx;

              return (
                <div
                  key={item.year}
                  className="flex-1 flex flex-col items-center h-full group py-2"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {/* Bar Wrapper - This must have height to allow % children */}
                  <div className="relative w-full flex-1 flex items-end justify-center mb-3">
                    {/* Tooltip */}
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-xl transition-all duration-200 z-10 ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                      }`}
                      style={{ background: "#1e1b4b" }}
                    >
                      {item.visits.toLocaleString()}
                    </div>

                    {/* The Bar */}
                    <div
                      className={`w-full max-w-[20px] rounded-t-[2px] transition-all duration-300 ease-out`}
                      style={{
                        height: `${Math.max(heightPct, 4)}%`,
                        backgroundColor: isActive ? "#4f46e5" : "#e0e7ff",
                      }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-bold transition-colors shrink-0 ${
                    isActive ? "text-indigo-600" : "text-gray-400"
                  }`}>
                    {item.year.toString().slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight Box */}
        <div className="bg-indigo-600 rounded-lg p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon icon={faUsers} size="3x" />
          </div>
          <div className="relative z-10">
            <h4 className="text-base font-bold mb-1">Audience Milestone</h4>
            <p className="text-indigo-100 text-[11px] leading-relaxed max-w-sm">
              Your profile visibility has increased by <span className="text-white font-bold">5x</span>. Most visitors discover you through tagged vaults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisitsPage;
