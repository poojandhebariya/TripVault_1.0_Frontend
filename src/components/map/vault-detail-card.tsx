import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMountainSun,
  faLocationDot,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { type Vault } from "../../types/vault";
import { visibilityIcon } from "./map-constants";

interface VaultDetailCardProps {
  selectedVault: Vault;
  setSelectedVault: (v: Vault | null) => void;
  onViewVault: (id: string | undefined) => void;
}

const VaultDetailCard: React.FC<VaultDetailCardProps> = ({
  selectedVault,
  setSelectedVault,
  onViewVault,
}) => {
  const image = selectedVault.attachments.find((a) => a.type === "image");

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-600 w-[340px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-[popIn_0.2s_ease-out]">
        {/* image */}
        {image ? (
          <div className="h-28 md:h-36 relative shrink-0">
            <img
              src={image.url}
              alt={selectedVault.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={() => setSelectedVault(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        ) : (
          <div className="h-20 md:h-20 bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative shrink-0">
            <FontAwesomeIcon
              icon={faMountainSun}
              className="text-xl md:text-3xl text-indigo-300"
            />
            <button
              onClick={() => setSelectedVault(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        )}

        <div className="p-2.5 md:p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
            <div className="min-w-0 pr-2">
              <h3 className="font-extrabold text-gray-900 text-[13px] md:text-base leading-tight truncate">
                {selectedVault.title}
              </h3>
              {selectedVault.location?.label && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-indigo-400"
                  />
                  {selectedVault.location.label}
                </p>
              )}
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{
                background:
                  selectedVault.visibility === "private"
                    ? "#fef2f2"
                    : selectedVault.visibility === "friends"
                      ? "#fff7ed"
                      : "#f0fdf4",
                color:
                  selectedVault.visibility === "private"
                    ? "#dc2626"
                    : selectedVault.visibility === "friends"
                      ? "#ea580c"
                      : "#16a34a",
              }}
            >
              <FontAwesomeIcon
                icon={visibilityIcon(selectedVault.visibility)}
              />
              <span className="capitalize">{selectedVault.visibility}</span>
            </div>
          </div>

          <div className="flex gap-1.5 md:gap-2 flex-wrap mb-2.5 md:mb-3">
            {selectedVault.mood && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-semibold border border-purple-100">
                {selectedVault.mood}
              </span>
            )}
            {selectedVault.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => onViewVault(selectedVault.id)}
            className="w-full flex items-center justify-center gap-2 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold text-white cursor-pointer transition-all active:scale-95"
            style={{
              background: "linear-gradient(to right, #4f46e5, #7c3aed)",
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

export default VaultDetailCard;
