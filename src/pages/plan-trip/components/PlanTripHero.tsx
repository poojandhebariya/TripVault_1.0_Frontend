import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faMapPin } from "@fortawesome/free-solid-svg-icons";
import type { Place } from "../../../types/explore";

export const PlanTripHero = ({ place }: { place: Place }) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 w-full min-h-[35vh] md:min-h-[55vh] flex flex-col justify-end bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={
            place.image ||
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
          }
          alt={place.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 mt-auto">
        <div className="flex-1 text-left">
          <div className="flex items-center justify-start gap-2.5 mb-3">
            <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {place.country}
            </span>
            <span className="text-xl md:text-2xl drop-shadow-md">{place.emoji}</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-3 md:mb-4" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
            {place.name}
          </h1>

          <div className="flex items-center justify-start gap-2.5 text-gray-200 mb-4 md:mb-6">
            <FontAwesomeIcon icon={faMapPin} className="text-white/70 text-sm" />
            <span className="font-semibold text-sm md:text-base drop-shadow-md">{place.location}</span>
            <span className="mx-1 opacity-50">•</span>
            <span className="font-semibold text-sm md:text-base capitalize drop-shadow-md">{place.type}</span>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2">
            {place.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 bg-black/30 backdrop-blur-md border border-white/10 text-gray-100 text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-black/50 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
