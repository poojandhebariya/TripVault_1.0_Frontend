import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowTrendUp, faArrowLeft, faCirclePlay, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";

const VAULT_BREAKDOWN = [
  { title: "Santorini Sunsets",     time: "4m 12s", pct: 84 },
  { title: "Kyoto Cherry Blossoms", time: "3m 58s", pct: 79 },
  { title: "Iceland Road Trip",     time: "3m 20s", pct: 66 },
  { title: "Bali Hidden Temples",   time: "2m 45s", pct: 55 },
  { title: "Swiss Alps Hiking",     time: "1m 55s", pct: 38 },
];

const AVG_TIME   = "2m 45s";
const INDUSTRY   = "1m 29s";
const YOUR_PCT   = 55;
const IND_PCT    = 29.7;
const GROWTH_PCT = 85;

const AvgTimeSpentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Avg. Time Spent" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Engagement Depth</h2>
        <p className="text-xs text-gray-400">Average duration users spend exploring your vaults</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {/* Hero Scale Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{AVG_TIME}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Your Average Session</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-bold text-base">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-sm" />
                <span>{GROWTH_PCT}%</span>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Above Industry Avg</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-[0.1em]">
              <span>0m</span>
              <span>Benchmark</span>
              <span>5m</span>
            </div>
            <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-visible">
              {/* Industry avg line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-gray-300 z-10 -translate-x-1/2"
                style={{ left: `${IND_PCT}%` }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-400 whitespace-nowrap">
                  GLOBAL AVG ({INDUSTRY})
                </div>
              </div>

              {/* Your fill */}
              <div
                className="h-full rounded-full shadow-md transition-all duration-1000 ease-out"
                style={{
                  width: `${YOUR_PCT}%`,
                  background: "#4f46e5",
                }}
              />
              
              {/* Your marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-indigo-600 shadow-sm flex items-center justify-center -translate-x-1/2"
                style={{ left: `${YOUR_PCT}%` }}
              >
                <div className="w-1 h-1 rounded-full bg-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Vaults List */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <FontAwesomeIcon icon={faRankingStar} className="text-sm" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Highest Engagement</h3>
          </div>

          <div className="space-y-5">
            {VAULT_BREAKDOWN.map((vault, i) => (
              <div key={vault.title} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-200">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {vault.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCirclePlay} className="text-indigo-400 text-xs" />
                    <span className="text-xs font-bold text-indigo-600">
                      {vault.time}
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${vault.pct}%`,
                      background: "#4f46e5",
                      opacity: 1 - i * 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvgTimeSpentPage;
