import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { type CountryIndex } from "../../data/countries-index";

export const CountryCard = ({
  country,
  palette,
  onClick,
}: {
  country: CountryIndex;
  palette: string;
  onClick: () => void;
}) => {
  const [flagLoaded, setFlagLoaded] = React.useState(false);
  const [flagError, setFlagError] = React.useState(false);
  const flagUrl = `https://flagcdn.com/w80/${country.code.toLowerCase()}.png`;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Gradient Header */}
      <div
        className={`bg-linear-to-br ${palette} h-28 relative overflow-hidden flex items-center justify-between px-4`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
        {/* Decorative shapes */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 left-8 w-20 h-20 bg-black/10 rounded-full" />

        {/* Left: Country code + name */}
        <div className="relative flex flex-col z-10">
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] mb-0.5">
            {country.continent}
          </span>
          <span className="text-white text-3xl font-bold tracking-tighter leading-none">
            {country.code}
          </span>
          <span className="text-white/60 text-xs font-semibold mt-0.5">
            {country.name}
          </span>
        </div>

        {/* Right: Flag image */}
        <div className="relative z-10 w-16 h-11 rounded-lg overflow-hidden shadow-lg border-2 border-white/30 shrink-0 bg-white/10 flex items-center justify-center">
          {!flagError && (
            <img
              src={flagUrl}
              alt={`${country.name} flag`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${flagLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setFlagLoaded(true)}
              onError={() => setFlagError(true)}
            />
          )}
          {(!flagLoaded || flagError) && (
            <span className="text-white/50 text-lg absolute inset-0 flex items-center justify-center">
              {country.emoji}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors">
            {country.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-indigo-400 text-[9px]"
            />
            <span className="text-indigo-700 text-[11px] font-bold">
              {country.places_count}
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-xs">
          {country.places_count} curated destinations
        </p>

        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gray-100">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            {country.continent}
          </span>
          <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            Explore{" "}
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
          </span>
        </div>
      </div>
    </div>
  );
};
