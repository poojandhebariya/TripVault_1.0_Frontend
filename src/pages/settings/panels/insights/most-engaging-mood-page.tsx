import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faCompass, faCloudSun, faUtensils, faCamera, faArrowLeft, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";

const MOOD_DATA = [
  { mood: "Adventure", icon: faCompass, pct: 88, color: "#f97316", count: 1420, trend: "+12%" },
  { mood: "Chill", icon: faCloudSun, pct: 64, color: "#06b6d4", count: 980, trend: "+5%" },
  { mood: "Cultural", icon: faUtensils, pct: 45, color: "#8b5cf6", count: 650, trend: "-2%" },
  { mood: "Photography", icon: faCamera, pct: 32, color: "#ec4899", count: 420, trend: "+24%" },
];

const MostEngagingMoodPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Engaging Mood" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Content Vibe</h2>
        <p className="text-xs text-gray-400">The trip vibe that resonates most with your audience</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {/* Winner Hero Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-2 -translate-y-2">
            <FontAwesomeIcon icon={faCompass} size="4x" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest mb-4 border border-white/30">
              <FontAwesomeIcon icon={faFire} className="text-orange-200" />
              Reigning Mood
            </div>
            <h3 className="text-2xl font-bold mb-2">Adventure</h3>
            <p className="text-orange-100 text-[11px] max-w-sm leading-relaxed">
              Your high-energy vaults receive <span className="text-white font-bold">40% higher</span> engagement rates.
            </p>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOOD_DATA.map((item) => (
            <div key={item.mood} className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: item.color, boxShadow: `0 4px 12px ${item.color}22` }}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-base" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.mood}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{item.count.toLocaleString()} interactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold" style={{ color: item.color }}>{item.pct}%</p>
                  <p className={`text-[9px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {item.trend} trend
                  </p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tip Box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-4">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <FontAwesomeIcon icon={faLightbulb} className="text-xs" />
          </div>
          <div>
            <h5 className="text-[11px] font-bold text-indigo-900 mb-0.5 uppercase tracking-wide">Growth Strategy</h5>
            <p className="text-[11px] text-indigo-700/80 leading-relaxed">
              Your "Photography" mood surged <span className="font-bold text-indigo-900">24%</span>. Add cinematic shots to maximize reach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MostEngagingMoodPage;
