import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faLandmark, faCircleInfo, faSun } from "@fortawesome/free-solid-svg-icons";
import type { TripPlan } from "../../../types/trip";
import { TIME_COLOR, TIME_ICON } from "../constants";

export const ActivityRow = ({
  activity,
  index,
  isLast,
}: {
  activity: TripPlan["days"][0]["activities"][0];
  index: number;
  isLast: boolean;
}) => {
  const timeKey = (activity.timeOfDay ?? "morning").toLowerCase();
  const style = TIME_COLOR[timeKey] ?? TIME_COLOR.morning;
  const icon = TIME_ICON[timeKey] ?? faSun;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3 pt-3.5"
    >
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-7 h-7 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center ${style.text}`}
        >
          <FontAwesomeIcon icon={icon} className="text-[10px]" />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gray-100 mt-1.5 min-h-[20px]" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-[13px] font-bold text-gray-900">{activity.name}</p>
          {activity.mustSee && (
            <span className="flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
              <FontAwesomeIcon icon={faStar} className="text-[7px]" />
              Must See
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${style.text}`}
          >
            {activity.timeOfDay}
          </span>
          {activity.duration && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <FontAwesomeIcon icon={faClock} className="text-[8px]" />
              {activity.duration}
            </span>
          )}
          {activity.entryFee && (
            <span className="text-[10px] text-gray-400">
              Entry: {activity.entryFee}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-2">
          {activity.description}
        </p>

        {activity.history && (
          <div className="flex items-start gap-2 p-2.5 bg-indigo-50/70 rounded-xl border-l-2 border-indigo-300 mb-2">
            <FontAwesomeIcon
              icon={faLandmark}
              className="text-indigo-400 text-[9px] mt-0.5 shrink-0"
            />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {activity.history}
            </p>
          </div>
        )}

        {activity.tip && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="text-amber-400 text-[9px] mt-0.5 shrink-0"
            />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              {activity.tip}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
