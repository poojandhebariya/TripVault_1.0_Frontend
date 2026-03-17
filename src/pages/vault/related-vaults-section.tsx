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
import { cn } from "../../lib/cn-merge";
import { MOODS } from "../../utils/moods";

/* ── fetch helpers ───────────────────────────────────────────────────────── */

const fetchVaultsByLocation = async (
  location: string,
  excludeId: string,
): Promise<Vault[]> => {
  const res = await axiosInstance.get<ApiResponse<any>>(
    `/vault/related/location?location=${encodeURIComponent(
      location,
    )}&excludeId=${excludeId}&page=1&limit=10`,
  );
  return res.data.data?.data ?? [];
};

const fetchVaultsByTags = async (
  tags: string[],
  excludeId: string,
): Promise<Vault[]> => {
  const res = await axiosInstance.get<ApiResponse<any>>(
    `/vault/related/tags?tags=${tags.join(
      ",",
    )}&excludeId=${excludeId}&page=1&limit=10`,
  );
  return res.data.data?.data ?? [];
};

/* ── Carousel Card ───────────────────────────────────────────────────────── */

const CarouselCard = ({ vault }: { vault: Vault }) => {
  const navigate = useNavigate();
  const cover =
    vault.attachments?.find((a) => a.type === "image") ||
    vault.attachments?.[0];

  const mood =
    MOODS.find(
      (m) =>
        m.id === vault.mood?.toLowerCase() ||
        m.label.toLowerCase() === vault.mood?.toLowerCase(),
    ) ?? null;

  return (
    <div
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate(`/vault/${vault.id}`);
      }}
      className="group relative shrink-0 w-full md:w-[280px] h-[240px] sm:h-[300px] md:h-[400px] text-left rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer md:snap-start active:bounce-click"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {cover ? (
          <img
            src={cover.url}
            alt={vault.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2">
            <FontAwesomeIcon icon={faImage} className="text-gray-200 text-5xl" />
          </div>
        )}
      </div>

      {/* Mood Badge (Top Left) */}
      {mood && (
        <div className="absolute top-5 left-5 z-20">
          <div
            className={cn(
              "flex items-center gap-1.5 bg-linear-to-r text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/10",
              mood.bg,
            )}
          >
            <span>{mood.emoji}</span>
            <span className="hidden group-hover:inline-block transition-all duration-300">
              {mood.label}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Content Card (Glassmorphism) */}
      <div className="absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 p-2 md:p-4 rounded-xl md:rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 text-white transition-all duration-500 group-hover:bg-black/40">
        <div className="flex flex-col gap-1 md:gap-1.5">
          {vault.location?.label && (
            <div className="flex items-center gap-1 opacity-90">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="text-rose-400 text-[8px] md:text-[10px]"
              />
              <span className="text-[7px] md:text-[9px] font-black tracking-widest uppercase truncate">
                {vault.location.label.split(",")[0]}
              </span>
            </div>
          )}

          <h3 className="font-extrabold text-[10px] sm:text-sm md:text-lg leading-tight truncate drop-shadow-md group-hover:text-blue-200 transition-colors">
            {vault.title}
          </h3>

          <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10">
            {/* Author */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (vault.author?.id) {
                  navigate(`/user/${vault.author.id}`);
                }
              }}
              className="flex items-center gap-1.5 md:gap-2 min-w-0"
            >
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-linear-to-br from-blue-500/50 to-purple-600/50 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                {vault.author?.profilePicUrl ? (
                  <img
                    src={vault.author.profilePicUrl}
                    className="w-full h-full object-cover"
                    alt={vault.author.name || "user"}
                  />
                ) : (
                  <span className="text-[8px] md:text-[10px] font-bold">
                    {(vault.author?.name ||
                      vault.author?.username ||
                      "T")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-[8px] md:text-[11px] font-bold truncate opacity-90 hover:opacity-100 hover:underline">
                {vault.author?.name || vault.author?.username || "Traveller"}
              </span>
            </div>

            {/* Engagement */}
            <div className="hidden md:flex items-center gap-2 md:gap-3 shrink-0">
              <span className="flex items-center gap-1 font-bold text-[8px] md:text-[10px]">
                <FontAwesomeIcon icon={faHeart} className="text-rose-500" />
                {vault.likesCount ?? 0}
              </span>
              <span className="flex items-center gap-1 font-bold text-[8px] md:text-[10px]">
                <FontAwesomeIcon icon={faComment} className="text-white/70" />
                {vault.commentsCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <div className="">
      {/* Heavy beautiful header for the carousel */}
      <div className="px-1 mb-8 flex items-end justify-between">
        <div className="relative pl-4">
          {/* Accent bar */}
          <div className="absolute left-0 top-1 bottom-1 w-1.5 rounded-full bg-linear-to-b from-blue-600 to-purple-600 shadow-sm" />
          
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
            {title}
          </h2>
          <p className="text-sm md:text-lg font-medium text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Responsive Container: Grid on mobile, Scroller on Desktop */}
      {loading ? (
        <VaultCarouselSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:gap-8 md:overflow-x-auto pb-10 px-1 md:snap-x md:snap-mandatory pt-2 scroll-smooth no-scrollbar">
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
    queryFn: () => fetchVaultsByLocation(locationLabel, vaultId),
    enabled: !!locationLabel,
  });

  const { data: tagVaults = [], isLoading: loadingTags } = useQuery({
    queryKey: ["vault", "related-by-tags", tags.join(","), vaultId],
    queryFn: () => fetchVaultsByTags(tags, vaultId),
    enabled: tags.length > 0 && !loadingLocation,
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
