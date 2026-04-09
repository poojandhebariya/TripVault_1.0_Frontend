import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export const ErrorState = ({ error }: { error: string | null }) => {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-start gap-4"
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1" />
          <div>
            <h4 className="font-bold text-sm">Oops, something went wrong</h4>
            <p className="text-sm mt-1 opacity-80">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
