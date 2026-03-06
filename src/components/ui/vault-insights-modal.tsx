import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faXmark,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../../pages/types/vault";
import Modal from "./modal";

interface VaultInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: Vault;
}

const formatCount = (num: number): string => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

const VaultInsightsModal = ({
  isOpen,
  onClose,
  vault,
}: VaultInsightsModalProps) => {
  const displayCount = formatCount(vault.impressionsCount ?? 0);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="sm"
      className="bg-[#fafafa] border-none shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] rounded-[28px] md:rounded-[40px] overflow-hidden"
    >
      <div className="relative min-h-[420px] md:min-h-[520px] max-h-[85vh] overflow-y-auto flex flex-col py-4">
        {/* Artistic Background Accents */}
        <div className="absolute top-0 right-0 w-28 md:w-56 h-28 md:h-56 bg-linear-to-bl from-gray-100/40 to-transparent -mr-16 -mt-16 md:-mr-28 md:-mt-28 rounded-full blur-2xl md:blur-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-28 md:w-44 h-28 md:h-44 bg-gray-50/50 rounded-tr-[60px] md:rounded-tr-[90px] z-0" />

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start mb-8 md:mb-12">
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">
              Post Intelligence
            </h2>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extralight tracking-tight text-gray-900 leading-none">
              Vault{" "}
              <span className="font-serif italic text-gray-400 ml-1">
                Metrics
              </span>
            </h1>
          </div>

          <button
            onClick={onClose}
            className="group w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-all duration-500 cursor-pointer"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="text-gray-400 group-hover:text-black transition-all duration-500 text-sm"
            />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col gap-8 md:gap-10">
          {/* Global Exposure */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 md:w-8 h-px bg-gray-900" />
              <span className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
                Global Exposure
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between items-start">
              <div className="flex items-start gap-3 md:gap-4">
                <span className="text-5xl md:text-8xl font-thin tracking-tighter text-gray-950 leading-none select-none">
                  {displayCount}
                </span>

                <div className="mt-1 md:mt-3">
                  <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 border border-emerald-100 flex items-center gap-1">
                    <FontAwesomeIcon
                      icon={faArrowTrendUp}
                      className="text-[8px]"
                    />
                    <span>
                      {(vault.impressionsCount || 0) > 1000 ? "HIGH" : "SYNC"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 pb-2 md:pb-3 mt-2 md:mt-0">
                <span className="text-xs md:text-sm font-medium text-gray-400 italic">
                  Unique Impressions
                </span>

                <span className="hidden md:block text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Lifetime Total
                </span>
              </div>
            </div>
          </div>

          {/* Territories */}
          <div className="space-y-5 md:space-y-6">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon
                icon={faGlobe}
                className="text-gray-300 text-sm"
              />

              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                Engaged Territories
              </h3>
            </div>

            {vault.topCountries && vault.topCountries.length > 0 ? (
              <div className="grid gap-5 md:gap-6">
                {vault.topCountries
                  .slice(0, 3)
                  .map((country: string, index: number) => (
                    <div
                      key={country}
                      className="flex items-center gap-6 md:gap-8 group"
                    >
                      <div className="text-[10px] font-black text-gray-200 group-hover:text-gray-900 transition-colors duration-500">
                        0{index + 1}
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm md:text-base font-medium text-gray-600 group-hover:text-black transition-colors">
                            {country}
                          </span>

                          <span className="text-[10px] font-bold text-gray-300">
                            {100 - index * 20}% RELATIVE
                          </span>
                        </div>

                        <div className="h-px w-full bg-gray-100 relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gray-900 transition-all duration-1000 ease-out"
                            style={{ width: `${100 - index * 25}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-10 md:py-14 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-[28px] md:rounded-[36px] bg-white/40">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border border-gray-100 flex items-center justify-center mb-4">
                  <div className="w-2 h-2 rounded-full bg-gray-200 animate-ping" />
                </div>

                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                  Processing Global Data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-8 md:pt-12 flex flex-col md:flex-row items-start md:items-baseline justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-gray-900" />

            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              verified data sync
            </span>
          </div>

          <span className="text-[9px] font-serif italic text-gray-400 opacity-60">
            TripVault Intelligence System v2.1
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default VaultInsightsModal;
