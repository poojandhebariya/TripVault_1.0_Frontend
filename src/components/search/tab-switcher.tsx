import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faTableCells,
  faFolder,
  faUser,
  faMapPin,
} from "@fortawesome/free-solid-svg-icons";
import type { Tab, ViewMode } from "../../types/search";
import { BRAND_GRAD_R, fmtNum } from "./search-utils";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "vaults", label: "Vaults", icon: faFolder },
  { id: "people", label: "People", icon: faUser },
  { id: "places", label: "Places", icon: faMapPin },
];

interface TabSwitcherProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  tabCounts: Record<Tab, number>;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  showDropdown: boolean;
  debouncedQuery: string;
}

const TabSwitcher = ({
  activeTab,
  setActiveTab,
  tabCounts,
  viewMode,
  setViewMode,
  showDropdown,
  debouncedQuery,
}: TabSwitcherProps) => {
  if (!debouncedQuery || showDropdown) return null;

  return (
    <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
      <div className="flex gap-2 overflow-x-auto py-1 flex-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count = tabCounts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 border"
              style={
                active
                  ? {
                      background: BRAND_GRAD_R,
                      color: "#fff",
                      borderColor: "transparent",
                    }
                  : {
                      background: "#fff",
                      color: "#374151",
                      borderColor: "#e5e7eb",
                    }
              }
            >
              <FontAwesomeIcon icon={tab.icon} className="text-xs" />
              {tab.label}
              {count > 0 && (
                <span
                  className="hidden md:inline text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.22)", color: "#fff" }
                      : { background: "#f3f4f6", color: "#6b7280" }
                  }
                >
                  {fmtNum(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Layout toggle — only for vaults */}
      {activeTab === "vaults" && (
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={
              viewMode === "list"
                ? { background: BRAND_GRAD_R, color: "#fff" }
                : { color: "#9ca3af" }
            }
          >
            <FontAwesomeIcon icon={faList} className="text-sm" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={
              viewMode === "grid"
                ? { background: BRAND_GRAD_R, color: "#fff" }
                : { color: "#9ca3af" }
            }
          >
            <FontAwesomeIcon icon={faTableCells} className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TabSwitcher;
