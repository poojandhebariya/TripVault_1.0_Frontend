import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationArrow,
  faArrowRight,
  faBookmark,
  faCheckCircle,
  faPlus,
  faRoute,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../utils/constants";
import type { Place } from "../../types/explore";

interface PlaceDetailActionPanelProps {
  place: Place;
  isSaved: boolean;
  onSaveToBucketList: () => void;
  onGetDirection: () => void;
}

export const PlaceDetailActionPanel: React.FC<PlaceDetailActionPanelProps> = ({
  place,
  isSaved,
  onSaveToBucketList,
  onGetDirection,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
          Quick Actions
        </p>
      </div>
      <div className="p-4 space-y-2.5">
        {/* Get Direction — primary */}
        <button
          onClick={onGetDirection}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all group shadow-lg shadow-indigo-100 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faLocationArrow} className="text-sm" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Get Direction
            </span>
          </div>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm"
          />
        </button>

        {/* Save to Bucket List */}
        <button
          onClick={onSaveToBucketList}
          disabled={isSaved}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border active:scale-[0.98] transition-all group ${
            isSaved
              ? "bg-indigo-50 border-indigo-200 text-indigo-600 cursor-default"
              : "bg-white border-gray-100 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isSaved
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100"
              }`}
            >
              <FontAwesomeIcon icon={faBookmark} className="text-sm" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isSaved ? "Added!" : "Add to BucketList"}
            </span>
          </div>
          <FontAwesomeIcon
            icon={isSaved ? faCheckCircle : faPlus}
            className={`text-sm transition-colors ${
              isSaved
                ? "text-indigo-500"
                : "text-gray-200 group-hover:text-indigo-400"
            }`}
          />
        </button>

        {/* Plan Trip */}
        <button
          onClick={() => navigate(ROUTES.PLAN_TRIP, { state: { place } })}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-gray-100 text-gray-700 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 active:scale-[0.98] transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-400 group-hover:bg-violet-100 flex items-center justify-center transition-all">
              <FontAwesomeIcon icon={faRoute} className="text-sm" />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                Plan Trip
              </span>
              <span className="text-[9px] text-gray-400 font-medium">AI-powered itinerary</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-violet-50 border border-violet-100 rounded-lg">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-violet-400 text-[9px]" />
          </div>
        </button>
      </div>

      {/* Create TripVault CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={() =>
            navigate(ROUTES.VAULT.CREATE_VAULT, { state: { place } })
          }
          className="w-full relative overflow-hidden rounded-xl p-5 flex items-center gap-4 group cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
          }}
        >
          {/* Subtle shine */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white text-base shadow-lg group-hover:scale-110 transition-transform shrink-0">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div className="relative text-left">
            <p className="text-white text-[12px] font-bold uppercase tracking-[0.25em] leading-none mb-1.5">
              Create TripVault
            </p>
            <p className="text-white/60 text-[10px] font-medium leading-relaxed">
              Plan and save your full journey
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
