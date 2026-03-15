import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faImage,
  faHeart,
  faComment,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../types/api-response";
import type { Vault } from "../../types/vault";

/* ── fetch helpers ───────────────────────────────────────────────────────── */

const fetchVaultsByLocation = async (location: string): Promise<Vault[]> => {
  const res = await axiosInstance.get<ApiResponse<Vault[]>>(
    `/vault/public?location=${encodeURIComponent(location)}&limit=8`,
  );
  return (res.data.data as any)?.data ?? res.data.data ?? [];
};

const fetchVaultsByTags = async (tags: string[]): Promise<Vault[]> => {
  const res = await axiosInstance.get<ApiResponse<Vault[]>>(
    `/vault/public?tags=${tags.join(",")}&limit=8`,
  );
  return (res.data.data as any)?.data ?? res.data.data ?? [];
};

/* ── Carousel Card ───────────────────────────────────────────────────────── */

const CarouselCard = ({ vault }: { vault: Vault }) => {
  const navigate = useNavigate();
  const cover =
    vault.attachments?.find((a) => a.type === "image") ||
    vault.attachments?.[0];

  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate(`/vault/${vault.id}`);
      }}
      className="group relative shrink-0 w-[260px] md:w-[280px] h-[360px] md:h-[400px] text-left bg-gray-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer snap-start"
    >
      {/* Background Image */}
      {cover ? (
        <img
          src={cover.url}
          alt={vault.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 gap-2">
          <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
        </div>
      )}

      {/* Top right badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {vault.tags && vault.tags.length > 0 && (
          <div className="bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 text-white text-[10px] font-bold shadow-sm uppercase tracking-wider flex items-center gap-1.5">
            <FontAwesomeIcon icon={faTag} className="text-[9px]" />
            {vault.tags[0]}
          </div>
        )}
      </div>

      {/* Heavy Gradient Overlay for Text Visibility */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5" />

      {/* Content wrapper */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
        {vault.location?.label && (
          <div className="flex items-center gap-1.5 mb-2">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-rose-400 text-[11px]"
            />
            <span className="text-white/90 font-bold text-[10px] tracking-widest uppercase truncate drop-shadow-md">
              {vault.location.label.split(",")[0]}
            </span>
          </div>
        )}

        <h3 className="text-white font-bold text-xl leading-tight line-clamp-2 drop-shadow-lg mb-4 cursor-pointer group-hover:underline underline-offset-4 decoration-white/50">
          {vault.title}
        </h3>

        {/* Footer info line (Author + Engagement) */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          {/* Author */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (vault.author?.id) {
                navigate(`/user/${vault.author.id}`);
              }
            }}
            className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white/10">
              {vault.author?.profilePicUrl ? (
                <img
                  src={vault.author.profilePicUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-[10px] font-bold">
                  {(vault.author?.name ||
                    vault.author?.username ||
                    "T")[0].toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-white text-xs font-semibold truncate drop-shadow-sm hover:underline">
              {vault.author?.name || vault.author?.username || "Traveller"}
            </span>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 text-white font-medium text-[11px] drop-shadow-sm">
              <FontAwesomeIcon icon={faHeart} className="text-rose-400" />
              {vault.likesCount ?? 0}
            </span>
            <span className="flex items-center gap-1 text-white font-medium text-[11px] drop-shadow-sm">
              <FontAwesomeIcon icon={faComment} className="text-white/80" />
              {vault.commentsCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

/* ── Skeleton Scroller ───────────────────────────────────────────────────── */

import VaultCarouselSkeleton from "../../components/skeletons/vault-carousel-skeleton";

/* ── Carousel Section Banner ─────────────────────────────────────────────── */

const VaultCarousel = ({
  title,
  subtitle,
  vaults,
  loading,
}: {
  title: string;
  subtitle: string;
  vaults: Vault[];
  loading: boolean;
}) => {
  if (!loading && vaults.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Heavy beautiful header for the carousel */}
      <div className="px-1 mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
            {title}
          </h2>
          <p className="text-sm md:text-base font-medium text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Horizontal Scroller Container */}
      {loading ? (
        <VaultCarouselSkeleton />
      ) : (
        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 px-1 snap-x snap-mandatory pt-2 scroll-smooth no-scrollbar">
          {vaults.map((v) => (
            <CarouselCard key={v.id} vault={v} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Section ────────────────────────────────────────────────────────── */

const RelatedVaultsSection = ({ vault }: { vault: Vault }) => {
  const locationLabel = vault.location?.label ?? "";
  const tags = vault.tags ?? [];
  const vaultId = vault.id ?? "";

  const { data: locationVaults = [], isLoading: loadingLocation } = useQuery({
    queryKey: ["vault", "related-by-location", locationLabel, vaultId],
    queryFn: () => fetchVaultsByLocation(locationLabel),
    enabled: !!locationLabel,
    select: (data) => data.filter((v) => v.id !== vaultId).slice(0, 8),
  });

  const { data: tagVaults = [], isLoading: loadingTags } = useQuery({
    queryKey: ["vault", "related-by-tags", tags.join(","), vaultId],
    queryFn: () => fetchVaultsByTags(tags),
    enabled: tags.length > 0,
    select: (data) =>
      data
        .filter(
          (v) =>
            v.id !== vaultId && !locationVaults.some((lv) => lv.id === v.id),
        )
        .slice(0, 8),
  });

  const hasLocation = !!locationLabel;
  const hasTags = tags.length > 0;

  if (!hasLocation && !hasTags) return null;
  if (
    !loadingLocation &&
    !loadingTags &&
    locationVaults.length === 0 &&
    tagVaults.length === 0
  ) {
    return null;
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out]">
      {/* Same Location Carousel */}
      {hasLocation && (
        <VaultCarousel
          title={`More from ${locationLabel.split(",")[0]}`}
          subtitle="Explore other trips in this destination"
          vaults={locationVaults}
          loading={loadingLocation}
        />
      )}

      {/* Related Tags Carousel */}
      {hasTags && (
        <VaultCarousel
          title="Similar aesthetics"
          subtitle={`Curated trips handpicked for you based on #${tags[0]}`}
          vaults={tagVaults}
          loading={loadingTags}
        />
      )}
    </div>
  );
};

export default RelatedVaultsSection;
