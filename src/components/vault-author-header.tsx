import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faUser,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../types/vault";
import { relativeTime, formatDistance } from "../utils/formatters";
import { cn } from "../lib/cn-merge";

interface VaultAuthorHeaderProps {
  vault: Vault;
  className?: string;
  rightElement?: React.ReactNode;
  onAvatarClick?: () => void;
  onNameClick?: () => void;
}

const VaultAuthorHeader = ({
  vault,
  className,
  rightElement,
  onAvatarClick,
  onNameClick,
}: VaultAuthorHeaderProps) => {
  const timeAgo = relativeTime(vault.createdAt);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Avatar */}
      <div
        onClick={onAvatarClick}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 cursor-pointer"
      >
        {vault.author?.profilePicUrl ? (
          <img
            src={vault.author.profilePicUrl}
            alt={vault.author.name ?? "Author"}
            className="w-full h-full object-cover"
          />
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            className="text-white text-sm md:text-lg"
          />
        )}
      </div>

      {/* Name + location + distance */}
      <div className="min-w-0 flex-1">
        <p
          onClick={onNameClick}
          className="text-[14px] md:text-[15px] font-bold text-gray-900 truncate leading-tight cursor-pointer"
        >
          {vault.author?.name ?? vault.author?.username ?? "Traveller"}
        </p>
        <div className="flex items-center gap-1.5 mt-[3px] text-[12px] md:text-xs text-gray-500 overflow-hidden whitespace-nowrap">
          {vault.location?.label && (
            <>
              <FontAwesomeIcon
                icon={faLocationDot}
                className="text-rose-400 text-[10px] md:text-[11px] shrink-0"
              />
              <span
                className="truncate shrink min-w-0"
                title={vault.location.label}
              >
                {vault.location.label}
              </span>
              {timeAgo && (
                <span className="shrink-0 text-gray-300 mx-0.5 font-bold leading-none -translate-y-px">
                  ·
                </span>
              )}
            </>
          )}

          {timeAgo && (
            <span className="shrink-0 text-[11px] md:text-[12px]">
              {timeAgo}
            </span>
          )}
          {typeof vault.distance === "number" && (
            <span className="shrink-0 text-gray-300 mx-0.5 font-bold leading-none -translate-y-px">
              ·
            </span>
          )}
          {typeof vault.distance === "number" && (
            <>
              <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shrink-0">
                <FontAwesomeIcon
                  icon={faRoute}
                  className="text-[8px] md:text-[9px]"
                />
                {formatDistance(vault.distance)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right element (Follow button, Menu, etc.) */}
      {rightElement}
    </div>
  );
};

export default VaultAuthorHeader;
