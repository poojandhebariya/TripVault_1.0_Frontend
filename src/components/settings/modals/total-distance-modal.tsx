import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faEarthAmericas, faPlane, faCar, faWalking } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

const DISTANCE_STATS = [
  { label: "By Air", value: "10,420 km", icon: faPlane, color: "#6366f1" },
  { label: "By Road", value: "3,280 km", icon: faCar, color: "#f59e0b" },
  { label: "On Foot", value: "550 km", icon: faWalking, color: "#10b981" },
];

const MONTHLY_DATA = [450, 1200, 800, 2400, 1800, 3200];
const MAX_VAL = Math.max(...MONTHLY_DATA);

export const TotalDistanceModal = ({
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
      title="Total Distance Covered"
      description="The total journey tracked across all your vaults"
      icon={faRoute}
      size="md"
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Journey</p>
          <p className="text-5xl font-black gradient-text leading-tight">14,250 km</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 font-medium">
            <FontAwesomeIcon icon={faEarthAmericas} className="text-blue-500" />
            <span>0.35x around the Earth</span>
          </div>
        </div>

        {/* Activity Chart (Simplified SVG) */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
            Distance Activity
          </p>
          <div className="h-32 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-end justify-between px-4 pb-2">
            {MONTHLY_DATA.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group w-full">
                <div 
                  className="w-4/5 rounded-t-lg bg-indigo-200 transition-all duration-500 group-hover:bg-indigo-500 relative"
                  style={{ height: `${(val / MAX_VAL) * 80}px` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                    {val}km
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {DISTANCE_STATS.map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white text-xs mb-1" style={{ backgroundColor: stat.color }}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{stat.label}</p>
              <p className="text-sm font-black text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Achievement */}
        <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex items-center gap-4">
          <div className="text-3xl">🚀</div>
          <div>
            <p className="text-xs font-bold text-purple-800">Next Milestone</p>
            <p className="text-xs text-purple-600">Travel 5,750 km more to reach the "Half-Earth" badge!</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
