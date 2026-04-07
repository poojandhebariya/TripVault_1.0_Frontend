import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSuitcaseRolling,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { NEARBY_DUMMY as NEARBY } from "../../data/explore/dummy";

// ─── Component ─────────────────────────────────────────────────────────────────

export const PlaceDetailPlaces = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-1">
            Nearby Places
          </p>
          <p className="text-gray-400 text-xs">
            Hotels, restaurants & cafés close by
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Hotels", "Dining", "Cafés"].map((c, i) => (
            <button
              key={c}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${i === 0 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-400 border border-gray-100 hover:border-indigo-200 hover:text-indigo-500"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NEARBY.map((place, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-xl ${place.bg} border ${place.border} flex items-center justify-center ${place.accent} shrink-0`}
            >
              <FontAwesomeIcon icon={place.icon} className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {place.name}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
                {place.type}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                {place.tags}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-amber-400"
                  style={{ fontSize: 9 }}
                />
                <span className="text-xs font-bold text-gray-700">
                  {place.rating}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">{place.dist}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-white border border-indigo-100 rounded-2xl mx-auto flex items-center justify-center text-indigo-300 mb-4 shadow-sm">
          <FontAwesomeIcon icon={faSuitcaseRolling} className="text-lg" />
        </div>
        <p className="text-sm font-bold text-gray-900 mb-1">
          Live Integration Coming Soon
        </p>
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Real-time hotel, restaurant, and café listings via location APIs.
        </p>
      </div>
    </div>
  );
};
