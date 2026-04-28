import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faImages,
  faCheck,
  faClock,
  faThumbTack,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { userQueries } from "../../tanstack/user/queries";
import type { Vault } from "../../types/vault";
import VaultGridSkeleton from "../../components/skeletons/vault-grid-skeleton";
import VaultViewer from "./components/vault-viewer";
import { useParams } from "react-router-dom";

const TagStatusIndicator = ({ status, isPinned }: { status: string; isPinned: boolean }) => {
  if (isPinned) return (
    <div
      className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full flex items-center justify-center pointer-events-none z-10"
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
  );

  if (status === "accepted")
    return (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
        <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
        Accepted
      </div>
    );
  if (status === "pending")
    return (
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm animate-pulse z-10">
        <FontAwesomeIcon icon={faClock} className="text-[8px]" />
        Pending
      </div>
    );
  return null;
};

const TaggedVaultCard = ({ vault, onClick }: { vault: Vault; onClick: () => void }) => {
  const thumb = vault.attachments?.[0];

  return (
    <div 
      className="relative aspect-square overflow-hidden bg-gray-100 group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover */}
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
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)",
          }}
        >
          <FontAwesomeIcon icon={faImages} className="text-indigo-300 text-2xl" />
        </div>
      )}

      {/* Overlay (just to make the tag stand out slightly better) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Status/Pin badge */}
      <TagStatusIndicator status={vault.tagStatus ?? ""} isPinned={!!vault.isPinned} />

      {/* Tag indicator */}
      {vault.author && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-opacity duration-200 group-hover:opacity-0">
          <FontAwesomeIcon icon={faTag} className="text-[9px]" />
          @{vault.author.username}
        </div>
      )}
    </div>
  );
};

type TagFilter = "all" | "accepted" | "pending" | "declined";

const TAG_TABS: { key: TagFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "accepted", label: "Accepted" },
  { key: "pending", label: "Pending" },
  { key: "declined", label: "Refused" },
];

const Tagged = () => {
  const { id } = useParams<{ id: string }>();
  const isPublic = !!id;

  const { getTaggedVaults, getPublicTaggedVaults } = userQueries();
  const queryToUse = id ? getPublicTaggedVaults(id) : getTaggedVaults();

  const {
    data: taggedVaults = [],
    isLoading,
    isError,
  } = useQuery(queryToUse);

  const { getPublicProfile } = userQueries();
  const { data: profile } = useQuery({
    ...getPublicProfile(id ?? ""),
    enabled: isPublic,
  });

  const isPrivate = isPublic && profile?.privateAccount && !profile?.isFollowing;

  const [filter, setFilter] = useState<TagFilter>("all");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  // Filtering
  const filteredVaults = isPublic 
    ? taggedVaults // backend only returns accepted/public
    : filter === "all"
      ? taggedVaults
      : taggedVaults.filter(v => v.tagStatus === filter);

  const countOf = (key: TagFilter) =>
    key === "all"
      ? taggedVaults.length
      : taggedVaults.filter((v) => v.tagStatus === key).length;

  return (
    <div className="animate-[slideDown_0.3s_ease-out] pb-20 lg:pb-6">
      {/* Filter chips — only for own profile */}
      {!isPublic && (
        <div className="flex items-center gap-2 px-3.5 pt-3 pb-1 overflow-x-auto max-w-4xl mx-auto">
          {TAG_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                filter === key
                  ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
              }`}
            >
              {label}
              {!isLoading && (
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    filter === key ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {countOf(key)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-px mt-2 md:max-w-4xl md:mx-auto">
          <VaultGridSkeleton />
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center py-16 text-[13px] text-red-400 font-medium">
          Failed to load tagged vaults. Please try again.
        </p>
      )}

      {/* Empty state */}
      {!isLoading && !isError && (filteredVaults.length === 0 || isPrivate) && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)",
            }}
          >
            <FontAwesomeIcon icon={isPrivate ? faLock : faTag} className="text-indigo-400" />
          </div>
          <p className="text-[15px] font-bold text-gray-900">
            {isPrivate
              ? "This account is private"
              : isPublic 
                ? "No tagged posts" 
                : filter === "all" 
                  ? "No tagged posts yet" 
                  : `No ${filter} tagged posts`}
          </p>
          <p className="text-[13px] text-gray-400 mt-1.5 max-w-[200px] leading-relaxed">
            {isPrivate
              ? "Follow this user to see their tagged vaults."
              : isPublic
                ? "This traveller hasn't been accepted in any tagged vaults yet."
                : filter === "all"
                  ? "When someone tags you in a vault and you accept, it'll appear here."
                  : `You don't have any ${filter} tagged vaults yet.`}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && !isPrivate && filteredVaults.length > 0 && (
        <div className="grid grid-cols-3 gap-px mt-2 md:max-w-4xl md:mx-auto md:gap-0.5 md:bg-transparent">
          {filteredVaults.map((vault) => (
            <TaggedVaultCard
              key={vault.id}
              vault={vault}
              onClick={() => setSelectedVault(vault)}
            />
          ))}
        </div>
      )}

      {/* Vault Viewer */}
      {selectedVault && (
        <VaultViewer
          vault={selectedVault}
          allVaults={filteredVaults}
          onClose={() => setSelectedVault(null)}
          onNavigate={(v) => setSelectedVault(v)}
          readOnly={isPublic}
        />
      )}
    </div>
  );
};

export default Tagged;
