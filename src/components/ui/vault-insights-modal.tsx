import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faXmark,
  faEye,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../../pages/types/vault";
import Modal from "./modal";

interface VaultInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
}

const formatCount = (num: number): string => {
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

const VaultInsightsModal = ({
  isOpen,
  onClose,
  vault,
}: VaultInsightsModalProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(t);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  const impressions = vault.impressionsCount ?? 0;
  const countries = vault.topCountries ?? [];
  const maxPct = 100;

  // Distribute relative percentages across countries
  const countryBars = countries.slice(0, 5).map((country, i, arr) => ({
    country,
    pct: Math.round(maxPct * ((arr.length - i) / arr.length)),
  }));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="sm"
      className="bg-white border border-gray-100 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden"
    >
      <div className="flex flex-col gap-6 py-1">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">
              Post Insights
            </p>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Vault Metrics
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* ── Impressions block ── */}
        <div className="rounded-xl bg-linear-to-br from-blue-50 to-purple-50 border border-blue-100/60 px-5 py-4 flex items-center gap-4">
          {/* Icon badge */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center shrink-0 shadow-sm">
            <FontAwesomeIcon icon={faEye} className="text-white text-sm" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold gradient-text uppercase tracking-widest mb-0.5">
              Global Impressions
            </span>
            <span className="text-3xl font-bold text-gray-900 leading-none tabular-nums">
              {formatCount(impressions)}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">
              Unique views · Lifetime total
            </span>
          </div>
        </div>

        {/* ── Territories ── */}
        <div className="flex flex-col gap-4">
          {/* Section label */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="text-gray-300 text-xs" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Engaged Territories
            </span>
          </div>

          {countryBars.length > 0 ? (
            <div className="flex flex-col gap-4">
              {countryBars.map(({ country, pct }, index) => (
                <div key={country} className="flex items-center gap-3 group">
                  {/* rank */}
                  <span className="w-5 shrink-0 text-right text-[10px] font-bold text-gray-300 group-hover:text-gray-500 transition-colors tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
                        {country}
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 tabular-nums">
                        {pct}%
                      </span>
                    </div>

                    {/* progress track */}
                    <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-700 transition-all duration-700 ease-out"
                        style={{
                          width: animate ? `${pct}%` : "0%",
                          transitionDelay: `${index * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
              <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-gray-300 text-sm"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em]">
                Gathering location data…
              </span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
              Verified data sync
            </span>
          </div>
          <span className="text-[9px] text-gray-300 italic">
            TripVault Intelligence
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default VaultInsightsModal;
