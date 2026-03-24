import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faListCheck,
  faEarthAmericas,
  faFireFlameCurved,
  faCompass,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { type BucketListStats } from "../../types/bucket-list";

interface MapStatsBarProps {
  totalVaultsOnMap: number;
  totalBucketOnMap: number;
  stats?: BucketListStats | null;
  fitAll: () => void;
  activePanel: "none" | "bucket";
  setActivePanel: (p: "none" | "bucket") => void;
  isMobile: boolean;
}

const MapStatsBar: React.FC<MapStatsBarProps> = ({
  totalVaultsOnMap,
  totalBucketOnMap,
  stats,
  fitAll,
  activePanel,
  setActivePanel,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <div className="flex md:hidden! shrink-0 bg-white border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-3 flex-col gap-2 relative z-10">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/50 rounded-lg p-1.5 transition-all">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
              <FontAwesomeIcon icon={faMapLocationDot} className="text-white text-[10px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8.5px] font-bold text-indigo-400 uppercase tracking-wider mb-0 leading-tight">Vaults</span>
              <span className="text-[11px] font-extrabold text-indigo-900 truncate leading-tight">
                {totalVaultsOnMap} <span className="font-medium text-[9px] text-indigo-700/70">Locs</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-100/50 rounded-lg p-1.5 transition-all">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-200">
              <FontAwesomeIcon icon={faListCheck} className="text-white text-[10px]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8.5px] font-bold text-amber-500/80 uppercase tracking-wider mb-0 leading-tight">Bucket List</span>
              <span className="text-[11px] font-extrabold text-amber-900 truncate leading-tight">
                {totalBucketOnMap} <span className="font-medium text-[9px] text-amber-700/70">Items</span>
              </span>
            </div>
          </div>
          {stats && (
            <>
              <div className="flex items-center gap-2 bg-violet-50/80 border border-violet-100/50 rounded-lg p-1.5 transition-all">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faEarthAmericas} className="text-violet-600 text-[10px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[8.5px] font-bold text-violet-400 uppercase tracking-wider mb-0 leading-tight">World</span>
                  <span className="text-[11px] font-extrabold text-violet-900 truncate leading-tight">
                    {stats.countries} <span className="font-medium text-[9px] text-violet-700/70">Countries</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-100/50 rounded-lg p-1.5 transition-all">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faFireFlameCurved} className="text-orange-600 text-[10px]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[8.5px] font-bold text-orange-400 uppercase tracking-wider mb-0 leading-tight">Priorities</span>
                  <span className="text-[11px] font-extrabold text-orange-900 truncate leading-tight">
                    {stats.highPriority} <span className="font-medium text-[9px] text-orange-700/70">High</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={fitAll}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg active:scale-[0.98] active:bg-gray-50 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faCompass} />
            Fit All
          </button>
          <button
            onClick={() => setActivePanel(activePanel === "bucket" ? "none" : "bucket")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg border active:scale-[0.98] transition-all ${
              activePanel === "bucket"
                ? "bg-amber-500 text-white border-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                : "bg-white text-gray-700 border-gray-200 shadow-sm"
            }`}
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            {activePanel === "bucket" ? "Close Bucket" : "Open Bucket"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex shrink-0 bg-white border-b border-gray-100 px-4 py-3 items-center gap-3 overflow-x-auto shadow-sm">
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 shrink-0">
        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faMapLocationDot} className="text-white text-[9px]" />
        </div>
        <span className="text-xs font-bold text-indigo-700">
          {totalVaultsOnMap} Vault{totalVaultsOnMap !== 1 ? "s" : ""} on Map
        </span>
      </div>
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5 shrink-0">
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
          <FontAwesomeIcon icon={faListCheck} className="text-white text-[9px]" />
        </div>
        <span className="text-xs font-bold text-amber-700">
          {totalBucketOnMap} Bucket Locations
        </span>
      </div>
      {stats && (
        <>
          <div className="w-px h-5 bg-gray-200 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <FontAwesomeIcon icon={faEarthAmericas} className="text-violet-500 text-sm" />
            <span className="text-xs font-semibold text-gray-600">
              <span className="font-bold text-gray-900">{stats.countries}</span> Countries
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <FontAwesomeIcon icon={faFireFlameCurved} className="text-orange-500 text-sm" />
            <span className="text-xs font-semibold text-gray-600">
              <span className="font-bold text-gray-900">{stats.highPriority}</span> High Priority
            </span>
          </div>
        </>
      )}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          onClick={fitAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
        >
          <FontAwesomeIcon icon={faCompass} />
          Fit All
        </button>
        <button
          onClick={() => setActivePanel(activePanel === "bucket" ? "none" : "bucket")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
            activePanel === "bucket"
              ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <FontAwesomeIcon icon={faLayerGroup} />
          <span>Bucket List</span>
        </button>
      </div>
    </div>
  );
};

export default MapStatsBar;
