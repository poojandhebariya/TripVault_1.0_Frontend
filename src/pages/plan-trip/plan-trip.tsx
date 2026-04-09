import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

import type { Place } from "../../types/explore";
import type { TripPlan } from "../../types/trip";
import { generateTripPlan } from "../../utils/gemini";
import { generateTripPlanPdf } from "../../utils/GenerateTripPlanPdf";
import { ROUTES } from "../../utils/constants";
import MobileStickyHeader from "../../components/mobile-sticky-header";

// Components
import {
  PlanTripHero,
  DurationSelector,
  ErrorState,
  LoadingState,
  StatsGrid,
  DayCard,
  TravelTipsCard,
  EmptyState,
} from "./components";

const PlanTripPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const place = location.state?.place as Place | undefined;

  const [duration, setDuration] = React.useState(3);
  const [plan, setPlan] = React.useState<TripPlan | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedDay, setExpandedDay] = React.useState<number | null>(0);
  const [generated, setGenerated] = React.useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  React.useEffect(() => {
    if (!place) navigate(ROUTES.EXPLORE);
  }, [place, navigate]);

  if (!place) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    setGenerated(false);
    setExpandedDay(0);
    try {
      const result = await generateTripPlan(place, duration);
      setPlan(result);
      setGenerated(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!plan || !place) return;
    setIsGeneratingPdf(true);
    try {
      const dataUrl = await generateTripPlanPdf(plan, place);
      const fileName = `TripVault-Plan-${plan.destination.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      if (Capacitor.isNativePlatform()) {
        try {
          const base64Data = dataUrl.split(",")[1];
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });
          await Share.share({
            title: `${plan.destination} Trip Plan`,
            text: `My AI-generated trip plan for ${plan.destination} from TripVault!`,
            url: savedFile.uri,
            dialogTitle: "Save your trip plan",
          });
        } catch (shareErr: any) {
          if (
            shareErr.message?.includes("cancelled") ||
            shareErr.message?.includes("AbortError")
          ) {
            /* cancelled */
          }
        }
      } else {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      <div className="md:hidden">
        <MobileStickyHeader
          title={place.name}
          rightAction={
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              className="text-indigo-500"
            />
          }
        />
      </div>

      <PlanTripHero place={place} />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-10">
        <DurationSelector
          duration={duration}
          setDuration={setDuration}
          handleGenerate={handleGenerate}
          loading={loading}
          generated={generated}
        />

        <ErrorState error={error} />
        <LoadingState loading={loading} />

        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 md:space-y-10"
            >
              <StatsGrid
                plan={plan}
                isGeneratingPdf={isGeneratingPdf}
                handleDownloadPdf={handleDownloadPdf}
              />

              <div className="space-y-4">
                {plan.days.map((day, idx) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    index={idx}
                    expanded={expandedDay === idx}
                    onToggle={() =>
                      setExpandedDay(expandedDay === idx ? null : idx)
                    }
                  />
                ))}
              </div>

              {plan.travelTips && plan.travelTips.length > 0 && (
                <TravelTipsCard tips={plan.travelTips} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!plan && !loading && !error && <EmptyState placeName={place.name} />}
      </div>
    </div>
  );
};

export default PlanTripPage;
