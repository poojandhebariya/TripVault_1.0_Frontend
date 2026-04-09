import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import Button from "../../../components/ui/button";
import { DURATION_OPTIONS } from "../constants";

export const DurationSelector = ({
  duration,
  setDuration,
  handleGenerate,
  loading,
  generated,
}: {
  duration: number;
  setDuration: (val: number) => void;
  handleGenerate: () => void;
  loading: boolean;
  generated: boolean;
}) => {
  const activeOpt =
    DURATION_OPTIONS.find((o) => o.days === duration) || DURATION_OPTIONS[0];

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
        <div className="w-full flex-1 min-w-0">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between items-start">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 md:mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDays} className="text-gray-300" />
                Trip Duration
              </h3>

              <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                <div className="flex items-baseline gap-1.5 md:gap-2">
                  <span
                    className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-b from-indigo-500 to-purple-600 tracking-tighter leading-none"
                    style={{
                      filter: "drop-shadow(0px 2px 4px rgba(99,102,241,0.2))",
                    }}
                  >
                    {activeOpt.days}
                  </span>
                  <span className="text-xl md:text-3xl font-black text-gray-200 uppercase tracking-widest leading-none">
                    Days
                  </span>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100/50 shadow-sm shadow-indigo-500/10">
                    {activeOpt.sub}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative px-4 md:px-5 py-6 mt-2 md:mt-4">
            <div className="absolute inset-x-4 md:inset-x-5 top-1/2 -translate-y-1/2">
              <div className="w-full h-1.5 bg-gray-100 rounded-full shadow-inner" />
              <div
                className="absolute top-0 left-0 h-1.5 bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{
                  width: `${
                    (Math.max(
                      0,
                      DURATION_OPTIONS.findIndex((o) => o.days === duration),
                    ) /
                      (DURATION_OPTIONS.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="relative z-10 flex justify-between items-center -mx-4 md:-mx-5">
              {DURATION_OPTIONS.map((opt) => {
                const isActive = duration === opt.days;
                const isPast = duration > opt.days;

                return (
                  <button
                    key={opt.days}
                    onClick={() => setDuration(opt.days)}
                    className="flex flex-col items-center group cursor-pointer outline-none relative hover:z-20"
                  >
                    {!isActive && (
                      <span
                        className={`absolute -bottom-6 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${
                          isPast ? "text-indigo-400" : "text-gray-400"
                        }`}
                      >
                        {opt.sub}
                      </span>
                    )}

                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all duration-300 ease-out border-[3px] bg-white ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 scale-[1.3] md:scale-125 shadow-[0_8px_16px_-4px_rgba(99,102,241,0.4)] ring-4 ring-indigo-500/15"
                          : isPast
                            ? "border-indigo-500 text-indigo-600 group-hover:bg-indigo-50 group-hover:scale-110 shadow-sm"
                            : "border-gray-200 text-gray-400 group-hover:border-indigo-300 group-hover:text-indigo-500 group-hover:scale-110 shadow-sm"
                      }`}
                    >
                      {opt.days}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col md:items-end md:pl-8 md:border-l border-gray-100 pt-2 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            loading={loading}
            icon={!loading ? faWandMagicSparkles : undefined}
            text={generated ? "Regenerate Plan" : "Generate Itinerary"}
            className="w-full md:w-auto px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};
