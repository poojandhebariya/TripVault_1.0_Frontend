import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";

export const LoadingState = ({ loading }: { loading: boolean }) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="py-16"
        >
          <div className="flex flex-col items-center justify-center text-indigo-500 gap-5 bg-white rounded-3xl py-12 shadow-sm border border-gray-100">
            <div className="relative">
              <FontAwesomeIcon
                icon={faCircleNotch}
                className="text-5xl animate-spin text-indigo-200"
              />
              <FontAwesomeIcon
                icon={faWandMagicSparkles}
                className="absolute inset-0 m-auto text-xl text-indigo-600"
              />
            </div>
            <p className="font-bold tracking-widest uppercase text-xs">
              Crafting your perfect trip...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
