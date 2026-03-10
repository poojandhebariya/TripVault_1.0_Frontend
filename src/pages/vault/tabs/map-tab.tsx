import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../../../types/vault";

interface MapTabProps {
  vault: Vault;
}

const MapTab = ({ vault }: MapTabProps) => {
  if (!vault.location?.lat) {
    return (
      <div className="px-4 md:px-5 py-12 flex flex-col items-center gap-3 text-center animate-[slideTop_0.2s_ease-out]">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faMapLocationDot}
            className="text-gray-300 text-2xl"
          />
        </div>
        <p className="text-sm text-gray-400 font-medium">
          No location added for this vault.
        </p>
      </div>
    );
  }

  const { lat, lon, label } = vault.location;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(label ?? `${lat},${lon}`)}&z=14&output=embed`;

  return (
    <div className="animate-[slideTop_0.2s_ease-out]">
      {/* Location header banner */}
      <div className="flex items-start justify-between px-4 md:px-5 py-4 border-b border-gray-100 gap-4">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
            <FontAwesomeIcon
              icon={faMapLocationDot}
              className="text-rose-500 text-sm"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Location
            </p>
            <p className="text-sm font-bold text-gray-800 leading-snug wrap-break-word">
              {label}
            </p>
          </div>
        </div>
      </div>

      {/* Map iframe */}
      <div style={{ height: "320px" }}>
        <iframe
          title="Trip Location"
          src={mapSrc}
          width="100%"
          height="100%"
          className="border-0 block"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      {/* Coordinates footer */}
      <div className="px-4 md:px-5 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 font-mono text-center">
          {lat.toFixed(6)}, {lon.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default MapTab;
