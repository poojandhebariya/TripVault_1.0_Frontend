import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faWallet,
  faLeaf,
  faBolt,
  faCircleNotch,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import type { TripPlan } from "../../../types/trip";

export const StatsGrid = ({
  plan,
  isGeneratingPdf,
  handleDownloadPdf,
}: {
  plan: TripPlan;
  isGeneratingPdf: boolean;
  handleDownloadPdf: () => void;
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
        {[
          {
            label: "Duration",
            value: `${plan.days.length} Days`,
            icon: faCalendarDays,
            iconColor: "text-indigo-500",
            bgClass: "bg-indigo-50",
          },
          {
            label: "Est. Budget",
            value: plan.estimatedBudget ?? "Varies",
            icon: faWallet,
            iconColor: "text-emerald-500",
            bgClass: "bg-emerald-50",
          },
          {
            label: "Best Season",
            value: plan.bestSeason ?? "Anytime",
            icon: faLeaf,
            iconColor: "text-amber-500",
            bgClass: "bg-amber-50",
          },
          {
            label: "Pace",
            value: plan.pace ?? "Moderate",
            icon: faBolt,
            iconColor: "text-violet-500",
            bgClass: "bg-violet-50",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[1.5rem] p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3"
          >
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-[1rem] ${stat.bgClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
            >
              <FontAwesomeIcon
                icon={stat.icon}
                className={`${stat.iconColor} text-base md:text-lg`}
              />
            </div>
            <div className="flex flex-col justify-end mt-auto pt-2">
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-[13px] md:text-[15px] font-black text-gray-900 leading-tight">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="w-full md:w-[280px] shrink-0 flex flex-col items-stretch">
        <div className="bg-gray-900 rounded-[2rem] p-6 shadow-xl shadow-gray-900/10 flex flex-col items-center text-center relative overflow-hidden h-full justify-center group pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors" />

          <div className="relative z-10 w-full mb-6">
            <h4 className="text-white font-black text-lg md:text-xl mb-1.5">
              Ready to go?
            </h4>
            <p className="text-gray-400 text-[11px] font-semibold">
              Take your itinerary offline.
            </p>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="relative z-10 pointer-events-auto w-full py-4 bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-95 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon
              icon={isGeneratingPdf ? faCircleNotch : faDownload}
              className={isGeneratingPdf ? "animate-spin text-sm" : "text-sm"}
            />
            {isGeneratingPdf ? "Generating..." : "Download Trip PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};
