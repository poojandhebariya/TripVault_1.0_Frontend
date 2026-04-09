import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faCheck } from "@fortawesome/free-solid-svg-icons";

export const TravelTipsCard = ({ tips }: { tips: string[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
  >
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
        <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 leading-none">
          Travel Tips
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Insider knowledge for a better trip
        </p>
      </div>
    </div>
    <div className="p-4 grid gap-3">
      {tips.map((tip, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
            <FontAwesomeIcon
              icon={faCheck}
              className="text-indigo-600 text-[7px]"
            />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
        </div>
      ))}
    </div>
  </motion.div>
);
