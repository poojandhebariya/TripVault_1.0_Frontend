import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faCompass, faCloudSun, faUtensils, faCamera } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

const MOOD_DATA = [
  { mood: "Adventure", icon: faCompass, pct: 88, color: "#f97316", count: 1420 },
  { mood: "Chill", icon: faCloudSun, pct: 64, color: "#06b6d4", count: 980 },
  { mood: "Cultural", icon: faUtensils, pct: 45, color: "#8b5cf6", count: 650 },
  { mood: "Photography", icon: faCamera, pct: 32, color: "#ec4899", count: 420 },
];

export const MostEngagingMoodModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Most Engaging Mood"
      description="The trip vibe that resonates most with your audience"
      icon={faFire}
      size="md"
    >
      <div className="space-y-6">
        {/* Featured Winner */}
        <div className="relative rounded-2xl p-6 overflow-hidden border border-orange-100 bg-orange-50/50">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon icon={faCompass} size="4x" className="text-orange-600" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider mb-3">
              <FontAwesomeIcon icon={faFire} /> Current Favorite
            </span>
            <p className="text-4xl font-black text-orange-600 mb-1">Adventure</p>
            <p className="text-sm text-gray-500 font-medium">
              Your high-energy vaults get <span className="text-orange-600 font-bold">40% more</span> engagement than average.
            </p>
          </div>
        </div>

        {/* Mood Breakdown */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Engagement Breakdown
          </p>
          <div className="space-y-4">
            {MOOD_DATA.map((item) => (
              <div key={item.mood} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      <FontAwesomeIcon icon={item.icon} className="text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.mood}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{item.count.toLocaleString()} interactions</p>
                    </div>
                  </div>
                  <span className="text-sm font-black" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.pct}%`, 
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}44`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Card */}
        <div className="p-4 rounded-xl border border-blue-50 bg-blue-50/30">
          <p className="text-xs font-bold text-blue-700 mb-1">Traveler Tip</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Your "Adventure" vaults perform best on weekends. Try posting your next hike vault on Saturday morning!
          </p>
        </div>
      </div>
    </Modal>
  );
};
