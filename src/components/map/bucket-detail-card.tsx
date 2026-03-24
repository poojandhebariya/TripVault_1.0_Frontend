import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFireFlameCurved,
  faCalendarDay,
  faLocationDot,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { type BucketList } from "../../types/bucket-list";
import { priorityConfig } from "./map-constants";

interface BucketDetailCardProps {
  selectedBucket: BucketList;
  setSelectedBucket: (b: BucketList | null) => void;
  onViewVault: (id: string | undefined) => void;
}

const BucketDetailCard: React.FC<BucketDetailCardProps> = ({
  selectedBucket,
  setSelectedBucket,
  onViewVault,
}) => {
  const image = selectedBucket.vault.attachments.find((a) => a.type === "image");
  const pc = priorityConfig[selectedBucket.priority] ?? priorityConfig["LOW"];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-600 w-[340px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden animate-[popIn_0.2s_ease-out]">
        {image ? (
          <div className="h-24 md:h-32 relative shrink-0">
            <img
              src={image.url}
              alt={selectedBucket.vault.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={() => setSelectedBucket(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
            <span className="absolute bottom-1 md:bottom-2 left-2 md:left-3 text-white font-extrabold text-xs md:text-sm drop-shadow-md truncate max-w-[80%]">
              {selectedBucket.vault.title}
            </span>
          </div>
        ) : (
          <div className="h-16 md:h-16 bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-between px-3 md:px-4 relative shrink-0">
            <span className="font-extrabold text-amber-900 text-[13px] md:text-base truncate pr-2">
              {selectedBucket.vault.title}
            </span>
            <button
              onClick={() => setSelectedBucket(null)}
              className="w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        )}

        <div className="p-2.5 md:p-4">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-2 md:mb-3">
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border uppercase tracking-wide ${pc.color} ${pc.bg} ${pc.border}`}
            >
              <FontAwesomeIcon icon={faFireFlameCurved} />
              {selectedBucket.priority}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              <FontAwesomeIcon icon={faCalendarDay} />
              Target: {selectedBucket.targetYear}
            </span>
            {selectedBucket.vault.location?.label && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-amber-500"
                />
                {selectedBucket.vault.location.label
                  .split(",")
                  .pop()
                  ?.trim()}
              </span>
            )}
          </div>

          <button
            onClick={() => onViewVault(selectedBucket.vault.id)}
            className="w-full flex items-center justify-center gap-2 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold text-white cursor-pointer transition-all active:scale-95"
            style={{
              background: "linear-gradient(to right, #f59e0b, #d97706)",
            }}
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            View Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default BucketDetailCard;
