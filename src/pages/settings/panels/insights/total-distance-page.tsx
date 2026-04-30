import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faEarthAmericas, faGlobeAsia, faGlobeEurope, faArrowLeft, faFlagCheckered, faGlobeAfrica } from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";

const CONTINENT_STATS = [
  { label: "Asia", value: "8,420", icon: faGlobeAsia, bg: "bg-orange-50", text: "text-orange-600" },
  { label: "Europe", value: "3,150", icon: faGlobeEurope, bg: "bg-blue-50", text: "text-blue-600" },
  { label: "Americas", value: "2,680", icon: faEarthAmericas, bg: "bg-emerald-50", text: "text-emerald-600" },
  { label: "Africa", value: "1,240", icon: faGlobeAfrica, bg: "bg-red-50", text: "text-red-600" },
  { label: "Oceania", value: "850", icon: faRoute, bg: "bg-purple-50", text: "text-purple-600" },
];

const MONTHLY_DATA = [450, 1200, 800, 2400, 1800, 3200];
const MAX_VAL = Math.max(...MONTHLY_DATA);

const TotalDistancePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Total Distance" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Journey Metrics</h2>
        <p className="text-xs text-gray-400">Total visits categorized by continent</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {/* Journey Hero Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
            <FontAwesomeIcon icon={faRoute} size="4x" />
          </div>
          
          <div className="relative z-10 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Cumulative Journey</p>
            <p className="text-3xl font-bold text-indigo-600 mb-4">14,250 <span className="text-lg">km</span></p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
              <FontAwesomeIcon icon={faEarthAmericas} className="animate-pulse" />
              0.35x around the Earth
            </div>
          </div>
        </div>

        {/* Continent Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTINENT_STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg ${stat.bg} ${stat.text} flex items-center justify-center`}>
                <FontAwesomeIcon icon={stat.icon} className="text-base" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{stat.label}</p>
                <p className="text-base font-bold text-gray-800">{stat.value} <span className="text-[10px] font-medium text-gray-400 ml-1">visits</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Distance Activity</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last 6 Months</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-40 md:h-52 px-2 border-b border-gray-100">
            {MONTHLY_DATA.map((val, i) => {
              const h = (val / MAX_VAL) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full group py-2">
                  <div className="relative w-full flex-1 flex items-end justify-center mb-3">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-[#1e1b4b] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-lg">
                      {val}km
                    </div>
                    <div 
                      className="w-full max-w-[18px] md:max-w-[28px] rounded-t-[2px] bg-indigo-100 group-hover:bg-indigo-600 transition-all duration-200 ease-out"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Card */}
        <div className="bg-slate-900 rounded-lg p-5 text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon icon={faFlagCheckered} size="2x" />
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/10 backdrop-blur-sm">
            🚀
          </div>
          <div className="text-center md:text-left flex-1">
            <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">Next Milestone</p>
            <p className="text-base font-bold mb-0.5">Half-Earth Challenge</p>
            <p className="text-slate-400 text-[11px]">Travel <span className="text-white font-bold">5,750 km</span> more to earn a badge.</p>
          </div>
          <button className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-[11px] hover:bg-indigo-50 transition-colors shrink-0">
            View Badges
          </button>
        </div>
      </div>
    </div>
  );
};

export default TotalDistancePage;
