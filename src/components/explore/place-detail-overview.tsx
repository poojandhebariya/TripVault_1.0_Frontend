import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faTicket,
  faClock,
  faLandmark,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { type Place } from "../../types/explore";
import { ICON_MAP, ACCENTS } from "../../data/explore/theme";

// ─── Component ─────────────────────────────────────────────────────────────────
export const PlaceDetailOverview = ({ place }: { place: Place }) => {
  const ov = place.overview;

  // Fallback if overview is somehow missing
  if (!ov) {
    return (
      <p className="text-gray-400 text-sm">
        Details for {place.name} are being loaded…
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {/* ── About ──────────────────────────────────────────────────────────── */}
      <div className="relative md:ml-4">
        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-indigo-500 to-transparent rounded-full hidden md:block" />
        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-3">
          About this Place
        </p>
        <p className="text-gray-700 text-base leading-8 font-light max-w-2xl">
          {ov.about}
        </p>
      </div>

      {/* ── Highlights ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-5">
          Highlights
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ov.highlights.slice(0, 4).map((h, i) => {
            const style = ACCENTS[i % ACCENTS.length];
            const icon = ICON_MAP[h.icon] ?? faLandmark;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`group flex items-start gap-4 p-5 rounded-2xl ${style.light} border ${style.border} hover:shadow-md transition-all duration-300`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${style.accent}18`,
                    color: style.accent,
                  }}
                >
                  <FontAwesomeIcon icon={icon} className="text-sm" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${style.text} mb-1`}>
                    {h.label}
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Visitor Info ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em]">
            Visitor Information
          </p>
          {ov.currency && (
            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {ov.currency}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: faSun,
              label: "Best Time to Visit",
              value: ov.bestTime,
              sub: ov.bestTimeSub,
              accent: "#f59e0b",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
            {
              icon: faTicket,
              label: "Entry Fee",
              value: ov.entryFee,
              sub: ov.entryFeeSub,
              accent: "#10b981",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: faClock,
              label: "Recommended Stay",
              value: ov.tourDays,
              sub: ov.tourDaysSub,
              accent: "#6366f1",
              bg: "bg-indigo-50",
              border: "border-indigo-100",
            },
          ].map((inf, i) => (
            <div
              key={i}
              className={`${inf.bg} border ${inf.border} rounded-2xl p-5 flex flex-col gap-3`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${inf.accent}20`,
                  color: inf.accent,
                }}
              >
                <FontAwesomeIcon icon={inf.icon} className="text-xs" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {inf.label}
                </p>
                <p className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
                  {inf.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{inf.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
