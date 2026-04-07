import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faShareNodes, faMapPin, faLocationArrow, faStar } from "@fortawesome/free-solid-svg-icons";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Place } from "../../types/explore";

interface PlaceDetailHeroProps {
  place: Place;
  distanceText: string | null;
  displayRating: string;
  displayReviewCount: number;
  onShare: () => void;
}

export const PlaceDetailHero: React.FC<PlaceDetailHeroProps> = ({
  place,
  distanceText,
  displayRating,
  displayReviewCount,
  onShare,
}) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 220]);

  return (
    <div className="w-full max-w-7xl mx-auto px-0 md:px-6 mt-0 md:mt-6">
      <div className="relative h-[50vh] md:h-[520px] overflow-hidden md:rounded-2xl shadow-xl">
        {/* Parallax image */}
        <motion.div
          style={{ y: parallaxY }}
          className="absolute inset-x-0 -top-24 h-[130%] will-change-transform"
        >
          <img
            src={
              place.image ||
              "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop"
            }
            alt={place.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10" />

        {/* Back */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <button
            onClick={() => navigate(-1)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all shadow-xl cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[9px]" />
            <span className="hidden md:inline">Back</span>
          </button>
        </div>

        {/* Share */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          <button
            onClick={onShare}
            className="relative w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all shadow-xl cursor-pointer overflow-hidden"
          >
            <FontAwesomeIcon icon={faShareNodes} className="text-sm" />
          </button>
        </div>

        {/* Hero info — staggered animations */}
        <div className="absolute bottom-0 inset-x-0 flex flex-col justify-end px-6 md:px-10 pb-7 md:pb-10">
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            {place.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white uppercase tracking-[0.2em] rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none mb-3 drop-shadow-lg"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.22 }}
          >
            {place.name}
          </motion.h1>

          <motion.div
            className="flex flex-col md:flex-row md:items-center gap-3 text-white/70"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.38 }}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faMapPin}
                className="text-indigo-400 text-[10px]"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                {place.location}
              </span>
            </div>
            {distanceText && (
              <>
                <div className="w-1 h-1 rounded-full bg-white/30 hidden md:block" />
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faLocationArrow}
                    className="text-[9px] text-white/40"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                    {distanceText}
                  </span>
                </div>
              </>
            )}
            <div className="w-1 h-1 rounded-full bg-white/30 hidden md:block" />
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon
                icon={faStar}
                className="text-amber-400 text-[10px]"
              />
              <span className="text-[11px] font-bold">{displayRating}</span>
              <span className="text-[10px] text-white/40">
                ({displayReviewCount.toLocaleString()})
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
