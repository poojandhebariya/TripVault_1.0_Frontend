import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSuitcaseRolling,
  faChartLine,
  faLocationArrow,
  faMapLocationDot,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { vaultQueries } from "../../tanstack/vault/queries";
import { useUserContext } from "../../contexts/user/user";
import useIsMobile from "../../hooks/isMobile";
import useGeolocation, {
  type PermissionState,
} from "../../hooks/useGeolocation";

import VaultCard from "../../components/vault-card";
import VaultCardSkeleton from "../../components/vault-card-skeleton";
import FeedFilter, {
  type FeedFilter as FeedFilterType,
} from "../../components/feed-filter";
import BottomNavModal from "../../components/ui/bottom-nav-modal";
import HomeSidebar from "../../components/home-side-bar";
import Pagination from "../../components/pagination-bar";
import LocationBanner from "../../components/location-banner";

const Home = () => {
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>("trending");
  const [statsOpen, setStatsOpen] = useState(false);
  const [publicPage, setPublicPage] = useState(1);
  const [nearbyPage, setNearbyPage] = useState(1);
  const [radius, setRadius] = useState(20000); // Default to All (20,000km)

  const { user, isLoggedIn } = useUserContext();
  const isMobile = useIsMobile();
  const { location, permissionState, requestPermission } = useGeolocation();

  const locationGranted = permissionState === "granted" && location !== null;

  const { getPublicVaults, getNearbyVaults } = vaultQueries();

  const { data: publicData, isLoading: publicLoading } = useQuery({
    ...getPublicVaults(publicPage),
    enabled: activeFilter !== "nearby",
  });

  const { data: nearbyData, isLoading: nearbyLoading } = useQuery({
    ...getNearbyVaults(
      location?.lat ?? 0,
      location?.lng ?? 0,
      radius,
      nearbyPage,
    ),
    enabled: activeFilter === "nearby" && locationGranted,
  });

  const vaults =
    activeFilter === "nearby"
      ? (nearbyData?.data ?? [])
      : (publicData?.data ?? []);

  const totalPages =
    activeFilter === "nearby"
      ? (nearbyData?.totalPages ?? 1)
      : (publicData?.totalPages ?? 1);

  const currentPage = activeFilter === "nearby" ? nearbyPage : publicPage;

  const isLoading = activeFilter === "nearby" ? nearbyLoading : publicLoading;

  const variant = isMobile ? "mobile" : "desktop";

  const handleFilterChange = useCallback(
    (f: FeedFilterType) => {
      // If switching to nearby, and we don't have location/permission yet, try it.
      if (f === "nearby" && !locationGranted) {
        requestPermission();
      }
      setActiveFilter(f);
    },
    [locationGranted, requestPermission],
  );

  const handlePrevPage = () => {
    if (activeFilter === "nearby") {
      setNearbyPage((p) => Math.max(1, p - 1));
    } else {
      setPublicPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (activeFilter === "nearby") {
      setNearbyPage((p) => Math.min(totalPages, p + 1));
    } else {
      setPublicPage((p) => Math.min(totalPages, p + 1));
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto lg:flex lg:gap-8 lg:px-6 lg:py-8">
        <main className="flex-1 min-w-0">
          <div className="sticky -top-0.5 z-10 backdrop-blur-3xl bg-white/80 border-b border-gray-100 lg:static lg:border-none lg:py-0 lg:mb-5">
            <div className="flex items-center gap-2 py-3 overflow-x-hidden">
              <div className="flex-1 overflow-x-scroll">
                <FeedFilter
                  active={activeFilter}
                  onChange={handleFilterChange}
                />
              </div>

              {isMobile && (
                <button
                  type="button"
                  onClick={() => setStatsOpen(true)}
                  className="shrink-0 mr-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-purple-600 transition-all duration-200 active:scale-90 cursor-pointer"
                  title="Discover & Stats"
                >
                  <FontAwesomeIcon icon={faChartLine} />
                </button>
              )}
            </div>
          </div>

          {activeFilter === "nearby" &&
            (permissionState === "prompt" ||
              (permissionState === "granted" && !location)) && (
              <div
                className={`p-4 mx-4 lg:mx-0 mb-6 mt-4 lg:mt-0 bg-white border border-gray-100 rounded-3xl flex items-center justify-center gap-3 shadow-xs`}
              >
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin text-blue-500 text-lg"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Determining your location…
                </span>
              </div>
            )}

          {activeFilter === "nearby" &&
            !locationGranted &&
            (permissionState === "denied" ||
              permissionState === "disabled") && (
              <LocationBanner
                onRequest={requestPermission}
                state={permissionState}
              />
            )}

          {activeFilter === "nearby" && locationGranted && (
            <div className="mx-4 lg:mx-0 lg:mb-6 flex items-center justify-between py-3.5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50/80 flex items-center justify-center text-blue-600 shadow-xs">
                  <FontAwesomeIcon
                    icon={faMapLocationDot}
                    className="text-base"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400 leading-none mb-1.5">
                    Range
                  </span>
                  <span className="text-sm font-bold text-gray-800 tracking-tight leading-none">
                    {radius === 20000 ? "Global Discovery" : `${radius} km`}
                  </span>
                </div>
              </div>

              <div className="relative group shrink-0">
                <select
                  value={radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    setNearbyPage(1);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={250}>250 km</option>
                  <option value={500}>500 km</option>
                  <option value={20000}>Global</option>
                </select>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2.5 group-hover:bg-gray-100 group-hover:border-gray-200 transition-all duration-300">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                    Change
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div className={`mt-3 ${isMobile ? "" : "space-y-5 px-0"}`}>
            {isLoading ? (
              <div className={isMobile ? "" : "space-y-5"}>
                {[1, 2, 3].map((n) => (
                  <VaultCardSkeleton key={n} variant={variant} />
                ))}
              </div>
            ) : vaults.length === 0 ? (
              <div className="text-center py-20 text-gray-400 px-6">
                <FontAwesomeIcon
                  icon={
                    activeFilter === "nearby"
                      ? locationGranted
                        ? faLocationArrow
                        : faMapLocationDot // Show map icon if not granted
                      : faSuitcaseRolling
                  }
                  className="text-5xl mb-4 opacity-30"
                />
                <p className="text-lg font-semibold">
                  {activeFilter === "nearby"
                    ? locationGranted
                      ? "No vaults nearby"
                      : "Location Access Required"
                    : "No vaults yet"}
                </p>
                <p className="text-sm mt-1">
                  {activeFilter === "nearby"
                    ? locationGranted
                      ? "Try expanding your search radius"
                      : "We need your location to show vaults near you"
                    : "Be the first to share a trip!"}
                </p>
              </div>
            ) : (
              <div className={isMobile ? "" : "space-y-5"}>
                {vaults.map((vault) => (
                  <VaultCard key={vault.id} vault={vault} variant={variant} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && vaults.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          )}
        </main>

        {!isMobile && (
          <aside
            className="hidden lg:block w-80 xl:w-[22rem] shrink-0 sticky top-6 self-start pb-10"
            style={{ maxHeight: "calc(100vh - 6rem)", overflowY: "auto" }}
          >
            <div className="pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <HomeSidebar isLoggedIn={isLoggedIn} user={user} />
            </div>
          </aside>
        )}
      </div>

      <BottomNavModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        title="Discover"
        icon={faChartLine}
      >
        <HomeSidebar isLoggedIn={isLoggedIn} user={user} />
      </BottomNavModal>
    </div>
  );
};

export default Home;
