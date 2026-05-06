import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowTrendUp, faArrowTrendDown, faRankingStar, faChartBar, faEye } from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";
import { userQueries } from "../../../../tanstack/user/queries";
import { ROUTES } from "../../../../utils/constants";


const AvgTimeSpentPage = () => {
  const navigate = useNavigate();

  const { getProfileTimeStats } = userQueries();
  const { data, isLoading, isError } = useQuery(getProfileTimeStats());

  const avgSessionSeconds = data?.avgSessionSeconds || 0;
  const industryAvgSeconds = data?.industryAvgSeconds || 89;
  const aboveIndustryPct = data?.aboveIndustryPct || 0;
  const topVaults = data?.topVaults || [];

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds === 0) return "0m 0s";
    const m = Math.floor(totalSeconds / 60);
    const s = Math.round(totalSeconds % 60);
    return `${m}m ${s}s`;
  };

  const AVG_TIME = formatTime(avgSessionSeconds);
  const INDUSTRY = formatTime(industryAvgSeconds);

  // max benchmark is 5 mins = 300s
  const YOUR_PCT = Math.min((avgSessionSeconds / 300) * 100, 100);
  const IND_PCT = Math.min((industryAvgSeconds / 300) * 100, 100);
  const GROWTH_PCT = Math.abs(aboveIndustryPct);
  const isAbove = aboveIndustryPct >= 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
        <MobileStickyHeader title="Avg. Time Spent" />
        <div className="p-4 md:p-0 space-y-5">
          <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm animate-pulse h-40" />
          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
        <MobileStickyHeader title="Avg. Time Spent" />
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faChartBar} className="text-xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold text-sm">Could not load time data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Avg. Time Spent" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">

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
              <div className={`flex items-center justify-end gap-1.5 font-bold text-base ${isAbove ? "text-emerald-600" : "text-rose-600"}`}>
                <FontAwesomeIcon icon={isAbove ? faArrowTrendUp : faArrowTrendDown} className="text-sm" />
                <span>{GROWTH_PCT}%</span>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{isAbove ? "Above" : "Below"} Industry Avg</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-[0.1em]">
              <span>0m</span>
              <span>Benchmark</span>
              <span>5m</span>
            </div>
            <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-visible mb-6">
              {/* Industry avg line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-gray-300 z-10 -translate-x-1/2"
                style={{ left: `${IND_PCT}%` }}
              >
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-400 whitespace-nowrap">
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

          <div className="space-y-2">
            {topVaults.length === 0 ? (
              <p className="text-sm text-gray-400 font-semibold text-center py-4">No engagement data yet.</p>
            ) : (
              topVaults.map((vault, i) => (
                <div 
                  key={vault.id} 
                  className="group cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-xl transition-colors"
                  onClick={() => navigate(ROUTES.VAULT.VAULT_DETAIL.replace(":id", vault.id))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-200">
                        {i + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        {vault.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                        <span className="text-xs font-bold">{vault.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvgTimeSpentPage;
