import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StateTabs } from "../../components/ui/tabs";
import { PlaceDetailOverview } from "../../components/explore/place-detail-overview";
import { PlaceDetailTravellersPost } from "../../components/explore/place-detail-travellers-post";
import { PlaceDetailMap } from "../../components/explore/place-detail-map";
import { PlaceDetailReviews } from "../../components/explore/place-detail-reviews";
import { PlaceDetailPlaces } from "../../components/explore/place-detail-places";
import { PlaceDetailHero } from "../../components/explore/place-detail-hero";
import { PlaceDetailActionPanel } from "../../components/explore/place-detail-action-panel";
import ShareModal from "../../components/ui/share-modal";
import BucketListModal from "../../components/ui/bucket-list-modal";
import { useAuthGuard } from "../../contexts/auth-guard-context";
import { usePlaceDetail } from "../../hooks/explore/usePlaceDetail";
import { EXPLORE_TABS } from "../../data/explore/constants";
import { type TabName } from "../../types/explore";

// ─── Tabs logic ───────────────────────────────────────────────────────────────
const PLACE_TABS = EXPLORE_TABS.map((label) => ({ id: label, label }));

const PlaceDetail = () => {
  const {
    p,
    loading,
    isSaved,
    distanceText,
    displayRating,
    displayReviewCount,
    showShareModal,
    showBucketListModal,
    handleShare,
    handleCloseShare,
    handleOpenBucketList,
    handleCloseBucketList,
    handleSetLocalSaved,
  } = usePlaceDetail();

  const [activeTab, setActiveTab] = React.useState<TabName>("Overview");
  const { guard } = useAuthGuard();

  const handleSaveToBucketList = () => {
    if (isSaved) return;
    guard(() => {
      handleOpenBucketList();
    }, "save this place to your bucket list");
  };

  const handleGetDirection = () => {
    if (p.lat && p.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
        "_blank",
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.location}`)}`,
        "_blank",
      );
    }
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
            Loading destination…
          </p>
        </div>
      </div>
    );

  // Tabs extracted

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return <PlaceDetailOverview place={p} />;
      case "Travellers Post":
        return <PlaceDetailTravellersPost place={p} />;
      case "Map":
        return <PlaceDetailMap place={p} />;
      case "Reviews":
        return <PlaceDetailReviews place={p} />;
      case "Places":
        return <PlaceDetailPlaces />;
      default:
        return null;
    }
  };

  // ─── Page ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      {/* ════ PARALLAX HERO — extracted to component ════════════════════════════ */}
      <PlaceDetailHero
        place={p}
        distanceText={distanceText}
        displayRating={displayRating}
        displayReviewCount={displayReviewCount}
        onShare={handleShare}
      />

      {/* ════ BODY ═══════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mt-10">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* ── LEFT: tab area ──────────────────────────────────────────────── */}
          <div className="w-full md:flex-1 min-w-0 order-2 md:order-1">
            {/* Tab nav — shared StateTabs component with spring indicator */}
            <div className="sticky top-0 z-30 mb-8 border-x-0 mx-[-1rem] md:mx-0">
              <StateTabs
                tabs={PLACE_TABS}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id as TabName)}
                className="bg-white/95 backdrop-blur-md"
              />
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
                className="md:px-4 pt-2"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Action panel ──────────────────────────────────────────── */}
          <div className="w-full md:w-72 xl:w-80 shrink-0 md:sticky md:top-6 order-1 md:order-2 space-y-4">
            <PlaceDetailActionPanel
              place={p}
              isSaved={isSaved}
              onSaveToBucketList={handleSaveToBucketList}
              onGetDirection={handleGetDirection}
            />
          </div>
        </div>
      </div>

      <ShareModal
        open={showShareModal}
        onClose={handleCloseShare}
        url={window.location.href}
        title={`${p.name} - ${p.location}`}
        type="place"
      />

      <BucketListModal
        isOpen={showBucketListModal}
        onClose={handleCloseBucketList}
        onSuccess={handleSetLocalSaved}
        placeData={{
          placeId: p.id,
          placeName: p.name,
          placeLocation: p.location,
          placeCountry: p.country,
          placeCountryCode: p.countryCode,
          placeImage: p.image,
          placeLat: p.lat,
          placeLng: p.lng,
          placeType: p.type,
          placeEmoji: p.emoji,
        }}
      />
    </div>
  );
};

export default PlaceDetail;
