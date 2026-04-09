import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faMugHot } from "@fortawesome/free-solid-svg-icons";
import type { TripPlan } from "../../../types/trip";
import { ActivityRow } from "./ActivityRow";

export const DayCard = ({
  day,
  index,
  expanded,
  onToggle,
}: {
  day: TripPlan["days"][0];
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const wasExpanded = expanded;
    onToggle();
    if (!wasExpanded) {
      setTimeout(
        () =>
          ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm scroll-mt-16"
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50/70 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/60 flex flex-col items-center justify-center shrink-0">
            <span className="text-[7px] font-extrabold text-indigo-400 uppercase tracking-widest leading-none">
              Day
            </span>
            <span className="text-base font-black text-indigo-600 leading-tight">
              {day.day}
            </span>
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
              {day.theme}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-gray-400">
                {day.activities.length} activities
              </span>
              {day.highlights?.slice(0, 2).map((h) => (
                <span
                  key={h}
                  className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          className="text-gray-300 group-hover:text-indigo-400 transition-colors text-xs shrink-0 ml-2"
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 px-4 pb-4 pt-3">
              {day.activities.map((act, i) => (
                <ActivityRow
                  key={i}
                  activity={act}
                  index={i}
                  isLast={i === day.activities.length - 1}
                />
              ))}
              {day.meal && (
                <div className="mt-4 flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100/80 rounded-xl">
                  <div className="w-8 h-8 rounded-xl bg-white border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                    <FontAwesomeIcon icon={faMugHot} className="text-xs" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
                      Local Cuisine
                    </p>
                    <p className="text-xs font-semibold text-gray-800 leading-snug">
                      {day.meal}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
