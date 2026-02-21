import { faArrowRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button";
import { ROUTES } from "../../utils/constants";

export const LoginPrompt = ({
  onClose,
  context,
}: {
  onClose: () => void;
  context: "profile" | "plan";
}) => {
  const navigate = useNavigate();

  const copy = {
    profile: {
      emoji: "👤",
      headline: "Your profile awaits",
      body: "Sign in to manage your account, view your trips, and personalise your TripVault experience.",
    },
    plan: {
      emoji: "🗺️",
      headline: "Start planning adventures",
      body: "Sign in to create trip plans, save routes, and build your ultimate bucket list.",
    },
  }[context];

  return (
    <div className="flex flex-col items-center gap-6 py-4 px-2">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg text-4xl"
        style={{ background: "linear-gradient(135deg, #1d4ed8, #7e22ce)" }}
      >
        <FontAwesomeIcon icon={faLock} className="text-3xl" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-xl font-bold text-gray-900">{copy.headline}</p>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
          {copy.body}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 mt-1">
        <Button
          text="Sign In"
          icon={faArrowRight}
          onClick={() => {
            onClose();
            navigate(ROUTES.AUTH.SIGN_IN);
          }}
          className="py-3.5 text-base font-semibold"
        />
        <Button
          variant="outline"
          text="Create an Account"
          onClick={() => {
            onClose();
            navigate(ROUTES.AUTH.SIGN_UP);
          }}
          className="py-3.5 text-base font-semibold"
        />
      </div>

      <button
        onClick={onClose}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-150 pb-2"
      >
        Maybe later
      </button>
    </div>
  );
};
