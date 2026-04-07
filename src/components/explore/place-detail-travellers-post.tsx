import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSuitcaseRolling,
  faMapLocationDot,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { vaultQueries } from "../../tanstack/vault/queries";
import VaultCard from "../../components/vault-card";
import VaultCardSkeleton from "../../components/skeletons/vault-card-skeleton";
import useIsMobile from "../../hooks/isMobile";

// ─── Types ─────────────────────────────────────────────────────────────────────
import { type Place } from "../../types/explore";

// ─── Component ─────────────────────────────────────────────────────────────────
export const PlaceDetailTravellersPost = ({ place }: { place: Place }) => {
  const isMobile = useIsMobile();
  const variant = isMobile ? "mobile" : "desktop";
  
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  // Use only the place NAME — it's the most specific, unique identifier.
  // Additionally, we pass place.location so the backend can extract the city/region
  // (e.g. "Goa" from "Goa, India") and match vault location labels like "Goa, India".
  const searchTerm = place.name;
  const searchLocation = place.location ?? "";

  const { getVaultsByPlace } = vaultQueries();
  const { data, isLoading, isFetching, isError } = useQuery(
    getVaultsByPlace(searchTerm, searchLocation, page, LIMIT),
  );

  const vaults = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-1">
            Vaults at this place
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            TripVaults created by travellers who visited{" "}
            <span className="text-gray-600 font-semibold">{place.name}</span>
          </p>
        </div>
        {!isLoading && total > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full"
          >
            <span className="text-[11px] font-bold text-indigo-600 tabular-nums">
              {total.toLocaleString()} vault{total !== 1 ? "s" : ""}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {isLoading || isFetching ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={isMobile ? "-mx-4 border-t border-gray-100" : "space-y-5"}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <VaultCardSkeleton key={i} variant={variant} />
            ))}
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-100 bg-red-50/40 py-14 text-center px-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 mx-auto flex items-center justify-center text-red-300 mb-4 shadow-sm">
              <FontAwesomeIcon icon={faSuitcaseRolling} className="text-lg" />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">
              Could not load vaults
            </p>
            <p className="text-xs text-gray-400">
              Something went wrong. Please try again later.
            </p>
          </motion.div>
        ) : vaults.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 py-16 text-center px-6"
          >
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-2xl bg-indigo-100/70 animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-300 shadow-sm">
                <FontAwesomeIcon icon={faMapLocationDot} className="text-2xl" />
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1.5">
              No vaults for this place yet
            </p>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              Be the first to share your journey to{" "}
              <span className="text-gray-600 font-semibold">{place.name}</span>.
              Create a TripVault and inspire the world!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`vaults-page-${page}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={isMobile ? "-mx-4 border-t border-gray-100" : "space-y-5"}
          >
            {vaults.map((vault) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                variant={variant}
                trackImpression={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pagination ── */}
      {!isLoading && !isFetching && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 py-2"
        >
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            Prev
          </button>
          <span className="text-sm text-gray-500 font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
          >
            Next
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
