import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { type Place } from "../../types/explore";
import { TYPE_ICONS, TYPE_THEME, DEFAULT_TYPE_THEME } from "../../data/explore/theme";

// ─── Component ─────────────────────────────────────────────────────────────────

export const PlaceCard = ({
  place,
  onClick,
}: {
  place: Place;
  onClick: () => void;
}) => {
  const theme = TYPE_THEME[place.type] || DEFAULT_TYPE_THEME;
  return (
    <div
      onClick={onClick}
      className={`group relative ${theme.bg} rounded-lg p-4 md:p-8 cursor-pointer hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-500 overflow-hidden border ${theme.border} h-full min-h-[160px] flex items-center`}
    >
      {/* Massive Icon Watermark on the Right */}
      <div className="absolute -right-6 -bottom-6 pointer-events-none opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700">
        <FontAwesomeIcon
          icon={TYPE_ICONS[place.type] || faMapPin}
          className={`text-[15rem] ${theme.text} -rotate-12 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-1000`}
        />
      </div>

      {/* Content Area (Left-aligned) */}
      <div className="relative z-10 flex flex-col gap-3 max-w-[70%]">
        <div className="flex items-center">
          <div
            className={` h-1.5 rounded-full ${theme.text.replace("text-", "bg-")}`}
          />
          <span
            className={`${theme.text} text-[10px] font-bold uppercase tracking-[0.3em]`}
          >
            {place.type}
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-gray-500">
            <FontAwesomeIcon
              icon={faMapPin}
              className="text-[11px] opacity-40 shrink-0"
            />
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">
              {place.location}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {place.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold text-gray-400 bg-white/50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle Hover Indicator */}
      <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 hidden md:block">
        <div
          className={`w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center ${theme.text} border border-theme.border`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-sm" />
        </div>
      </div>
    </div>
  );
};
