import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

const MapLegend = () => {
  return (
    <div className="absolute bottom-4 md:bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3 flex flex-col gap-2.5 transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1.5">
        <FontAwesomeIcon icon={faGlobe} className="text-gray-300" />
        Legend
      </p>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-4 h-4">
          <span className="absolute w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_2px_8px_rgba(99,102,241,0.5)]" />
        </div>
        <span className="text-xs font-bold text-gray-700 tracking-wide">
          My Vaults
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-4 h-4">
          <span className="absolute w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
        </div>
        <span className="text-xs font-bold text-gray-700 tracking-wide">
          Bucket List
        </span>
      </div>
    </div>
  );
};

export default MapLegend;
