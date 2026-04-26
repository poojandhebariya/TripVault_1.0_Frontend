import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faLock,
  faPalette,
  faTriangleExclamation,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../utils/constants";
import MobileStickyHeader from "../../components/mobile-sticky-header";
import { clsx } from "clsx";

const MENU_ITEMS = [
  {
    to: ROUTES.USER.SETTINGS_SECURITY,
    label: "Security",
    description: "Password, 2FA, active sessions",
    icon: faShield,
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_PRIVACY,
    label: "Privacy",
    description: "Account visibility, tagging, blocked users",
    icon: faLock,
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_APPEARANCE,
    label: "Appearance",
    description: "Theme and language preferences",
    icon: faPalette,
    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_DANGER,
    label: "Danger Zone",
    description: "Deactivate or delete your account",
    icon: faTriangleExclamation,
    iconBg: "bg-gradient-to-br from-red-500 to-red-700",
    danger: true,
  },
] as const;

/**
 * Shown as the index route of /user/profile/settings.
 * On mobile  → navigated to from the mobile hamburger menu → shows this list.
 * On desktop → never reached (desktop header goes directly to /settings/security).
 */
const SettingsMenuPage = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Settings" />

      <div className="p-5 space-y-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className={clsx(
              "w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 border shadow-sm text-left transition-all active:scale-[0.98] cursor-pointer",
              item.danger ? "border-red-100" : "border-gray-200",
            )}
          >
            <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", item.iconBg)}>
              <FontAwesomeIcon icon={item.icon} className="text-white text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={clsx("text-sm font-semibold", item.danger ? "text-red-600" : "text-gray-800")}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              className={clsx("text-xs shrink-0", item.danger ? "text-red-300" : "text-gray-300")}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsMenuPage;
