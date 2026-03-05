import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faComment,
  faImage,
  faVideo,
  faClock,
  faThumbTack,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../../types/vault";

interface VaultGridItemProps {
  vault: Vault;
  onClick: () => void;
}

const VaultGridItem = ({ vault, onClick }: VaultGridItemProps) => {
  const thumb = vault.attachments?.[0];
  const isMulti = vault.attachments.length > 1;
  const hasVideo =
    vault.attachments.some((a) => a.type === "video") ||
    thumb?.type === "video";

  return (
    <div
      className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {thumb?.url ? (
        thumb.type === "video" ? (
          <video
            src={`${thumb.url}#t=0.001`}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <img
            src={thumb.url}
            alt={vault.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 text-gray-300 text-3xl">
          <FontAwesomeIcon icon={faImage} />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-200 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
        <span className="flex items-center gap-1.5 text-white text-[13px] font-bold drop-shadow">
          <FontAwesomeIcon icon={faHeart} />
          {vault.likesCount ?? 0}
        </span>
        <span className="flex items-center gap-1.5 text-white text-[13px] font-bold drop-shadow">
          <FontAwesomeIcon icon={faComment} />
          {vault.commentsCount ?? 0}
        </span>
      </div>

      {(isMulti || hasVideo) && (
        <div className="absolute top-1.5 left-1.5 text-white drop-shadow-md text-sm pointer-events-none">
          <FontAwesomeIcon icon={hasVideo ? faVideo : faImage} />
        </div>
      )}

      {vault.status !== "publish" && (
        <div
          className={`absolute top-1.5 right-1.5 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none ${
            vault.status === "draft"
              ? "bg-amber-400/90 text-white"
              : "bg-violet-500/90 text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={vault.status === "draft" ? faImage : faClock}
            className="text-[8px]"
          />
          {vault.status === "draft" ? "Draft" : "Sched"}
        </div>
      )}

      {vault.isPinned && (
        <div
          className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f97316)",
            boxShadow:
              "0 0 0 2px rgba(255,255,255,0.75), 0 3px 10px rgba(251,147,36,0.65)",
          }}
        >
          <FontAwesomeIcon
            icon={faThumbTack}
            className="text-white text-[9px]"
            style={{
              transform: "rotate(45deg)",
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VaultGridItem;
