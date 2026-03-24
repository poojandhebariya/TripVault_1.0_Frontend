import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faXmark,
  faChevronRight,
  faFireFlameCurved,
  faCalendarDay,
  faLocationDot,
  faStar,
  faMountainSun,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { priorityConfig } from "./map-constants";
import Modal from "../ui/modal";
import { type BucketList, type BucketListStats } from "../../types/bucket-list";

interface BucketListPanelProps {
  activePanel: "none" | "bucket";
  setActivePanel: (p: "none" | "bucket") => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  filteredBucket: BucketList[];
  selectedBucket: BucketList | null;
  hoveredBucketId: number | null;
  setHoveredBucketId: (id: number | null) => void;
  flyToBucketItem: (item: BucketList) => void;
  isMobile: boolean;
  stats?: BucketListStats | null;
  onManageBucketList: () => void;
}

const BucketListPanel: React.FC<BucketListPanelProps> = ({
  activePanel,
  setActivePanel,
  priorityFilter,
  setPriorityFilter,
  filteredBucket,
  selectedBucket,
  hoveredBucketId,
  setHoveredBucketId,
  flyToBucketItem,
  isMobile,
  stats,
  onManageBucketList,
}) => {
  const bucketInner = (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white">
      {/* panel header - desktop only since mobile uses BottomNavModal via Modal prop */}
      <div
        className="hidden md:block shrink-0 px-5 py-4 border-b border-gray-100"
        style={{
          background: "linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faListCheck} className="text-amber-500" />
              Bucket List
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click a destination to fly to it on the map
            </p>
          </div>
          <button
            onClick={() => setActivePanel("none")}
            className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl border border-amber-100 shadow-sm px-3 py-2 text-center">
              <div className="text-lg font-black text-gray-900">
                {stats.totalPlaces}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Places
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-red-100 shadow-sm px-3 py-2 text-center">
              <div className="text-lg font-black text-orange-500">
                {stats.highPriority}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                High Prio
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl border border-violet-100 shadow-sm px-3 py-2 text-center">
              <div className="text-lg font-black text-violet-600">
                {stats.countries}
              </div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Countries
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Priority Filters */}
      <div className="shrink-0 flex gap-1.5 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto">
        {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all duration-200 ${
              priorityFilter === p
                ? "text-white border-transparent shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
            style={
              priorityFilter === p
                ? {
                    background: "linear-gradient(to right, #1d4ed8, #7c3aed)",
                  }
                : {}
            }
          >
            {p === "ALL" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {filteredBucket.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl mb-3">
              map
            </div>
            <p className="text-sm font-bold text-gray-700">No bucket list items</p>
            <p className="text-xs text-gray-400 mt-1">Add destinations from vault pages</p>
          </div>
        ) : (
          filteredBucket.map((item, idx) => {
            const vault = item.vault;
            const img = vault.attachments.find((a) => a.type === "image")?.url;
            const pc = priorityConfig[item.priority] ?? priorityConfig["LOW"];
            const isSelected = selectedBucket?.id === item.id;
            const isHovered = hoveredBucketId === item.id;
            const hasMap = !!vault.location?.lat && !!vault.location?.lon;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredBucketId(item.id)}
                onMouseLeave={() => setHoveredBucketId(null)}
                onClick={() => hasMap && flyToBucketItem(item)}
                className={`shrink-0 group relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? "border-amber-400 shadow-lg shadow-amber-100 scale-[1.01]"
                    : isHovered
                      ? "border-gray-300 shadow-md"
                      : "border-gray-100 shadow-sm"
                } ${hasMap ? "cursor-pointer" : "cursor-default opacity-80"}`}
              >
                {/* rank badge */}
                <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-black">
                  {idx + 1}
                </div>

                {/* image strip */}
                {img ? (
                  <div className="h-40 md:h-24 relative overflow-hidden">
                    <img
                      src={img}
                      alt={vault.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    {isSelected && (
                      <div className="absolute inset-0 ring-2 ring-amber-400 ring-inset" />
                    )}
                  </div>
                ) : (
                  <div className="h-32 md:h-16 bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faMountainSun}
                      className="text-2xl text-amber-300"
                    />
                  </div>
                )}

                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <h4 className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-1 flex-1">
                      {vault.title}
                    </h4>
                    {hasMap ? (
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[10px] text-gray-400 mt-0.5 shrink-0 group-hover:text-amber-500 transition-colors"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-[10px] text-gray-300 mt-0.5 shrink-0"
                        title="No map location"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${pc.color} ${pc.bg} ${pc.border}`}
                    >
                      <FontAwesomeIcon icon={faFireFlameCurved} />
                      {item.priority}
                    </span>
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      <FontAwesomeIcon icon={faCalendarDay} />
                      {item.targetYear}
                    </span>
                    {vault.location?.label && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600 min-w-0">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="text-amber-500 shrink-0"
                        />
                        <span className="truncate max-w-[90px]">
                          {vault.location.label.split(",").pop()?.trim()}
                        </span>
                      </span>
                    )}
                    {vault.isBucketListed && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <FontAwesomeIcon icon={faStar} />
                      </span>
                    )}
                  </div>

                  {!hasMap ? (
                    <p className="text-[9px] text-gray-400 mt-1.5 font-medium">
                      No map location set for this vault
                    </p>
                  ) : (
                    <div className="md:hidden mt-2.5 flex items-center justify-between pt-2 border-t border-gray-100/80">
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 flex-1 w-full bg-amber-50/50 rounded-lg px-2 py-1.5 justify-center">
                        <FontAwesomeIcon icon={faMapLocationDot} />
                        Tap to locate on map
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* panel footer */}
      <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onManageBucketList}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all active:scale-95 hover:opacity-90"
          style={{
            background: "linear-gradient(to right, #f59e0b, #d97706)",
          }}
        >
          <FontAwesomeIcon icon={faListCheck} />
          Manage Full Bucket List
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Modal
        open={activePanel === "bucket"}
        onClose={() => setActivePanel("none")}
        title="Bucket List"
        icon={faListCheck}
        variant="bottom"
        bodyClassName="p-0 overflow-hidden flex flex-col h-[75vh]"
      >
        {bucketInner}
      </Modal>
    );
  }

  return (
    <div
      className={`
        relative top-0 right-0 h-full z-400
        flex flex-col bg-white border-l border-gray-100 shadow-2xl
        transition-all duration-500 ease-in-out overflow-hidden
        ${activePanel === "bucket" ? "w-[360px]" : "w-0"}
      `}
    >
      <div className="flex flex-col h-full min-w-[360px]">{bucketInner}</div>
    </div>
  );
};

export default BucketListPanel;
