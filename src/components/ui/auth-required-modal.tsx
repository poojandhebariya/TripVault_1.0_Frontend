import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faRightToBracket,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../utils/constants";
import Button from "./button";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Contextual message shown to the user, e.g. "like a vault" */
  action?: string;
}

const AuthRequiredModal = ({
  isOpen,
  onClose,
  action = "do that",
}: AuthRequiredModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  const handleSignUp = () => {
    onClose();
    navigate(ROUTES.AUTH.SIGN_UP);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with fade-in */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      />

      {/* Modal Panel with slide-top animation */}
      <div
        className="relative w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl z-10 animate-[slideTop_0.3s_ease-out] animate-[fadeIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top color accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-600 to-purple-700" />

        <div className="px-6 pt-8 pb-10 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>

          {/* Graphical element */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-xl shadow-indigo-100">
              <FontAwesomeIcon icon={faLock} className="text-white text-2xl" />
            </div>
          </div>

          {/* Typography */}
          <div className="text-center mb-8 px-2">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Almost there!
            </h2>
            <p className="text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
              You need to be signed in to{" "}
              <span className="text-indigo-600 font-bold">{action}</span>.
              Create an account or sign in to save and share your travel
              memories.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3.5">
            <Button
              onClick={handleSignIn}
              text="Sign In"
              icon={faRightToBracket}
              variant="default"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
            />

            <Button
              onClick={handleSignUp}
              text="Create a New Account"
              icon={faUserPlus}
              variant="outline"
              className="w-full py-2 text-indigo-600 border-2 border-indigo-50 hover:bg-indigo-50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AuthRequiredModal;
