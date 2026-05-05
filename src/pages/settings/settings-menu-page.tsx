import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faLock,
  faPalette,
  faTriangleExclamation,
  faChevronRight,
  faChartLine,
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
    iconColor: "text-blue-600",
    stubBg: "bg-blue-50/40 group-hover:bg-blue-50/80",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_PRIVACY,
    label: "Privacy",
    description: "Account visibility, tagging, blocked users",
    icon: faLock,
    iconColor: "text-purple-600",
    stubBg: "bg-purple-50/40 group-hover:bg-purple-50/80",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_INSIGHTS,
    label: "Insights",
    description: "Visits, engagement, and travel reach",
    icon: faChartLine,
    iconColor: "text-emerald-600",
    stubBg: "bg-emerald-50/40 group-hover:bg-emerald-50/80",
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_DANGER,
    label: "Danger Zone",
    description: "Deactivate or delete your account",
    icon: faTriangleExclamation,
    iconColor: "text-red-600",
    stubBg: "bg-red-50/40 group-hover:bg-red-50/80",
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

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            className="group w-full flex bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300 hover:-translate-y-1 cursor-pointer"
          >
            {/* Ticket Stub (Left Side) - Faint tinted bg, but no bg box behind the icon! */}
            <div className={clsx(
              "w-20 sm:w-24 flex items-center justify-center shrink-0 border-r border-dashed border-gray-200 transition-colors duration-300",
              item.stubBg
            )}>
              <FontAwesomeIcon 
                icon={item.icon} 
                className={clsx("text-[22px] transition-transform duration-300 group-hover:scale-110", item.iconColor)} 
              />
            </div>
            
            {/* Ticket Body (Right Side) */}
            <div className="flex-1 p-4 sm:p-5 flex items-center justify-between min-w-0">
              <div className="text-left pr-4">
                <h3 className={clsx(
                  "text-[15px] sm:text-base font-bold tracking-tight mb-0.5", 
                  item.danger ? "text-red-600" : "text-gray-900"
                )}>
                  {item.label}
                </h3>
                <p className="text-[13px] text-gray-500 font-medium line-clamp-2 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* End Chevron */}
              <div className="w-8 h-8 rounded-full border border-transparent group-hover:border-gray-100 group-hover:bg-gray-50 flex items-center justify-center transition-all duration-300 shrink-0">
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={clsx(
                    "text-[12px] transition-transform duration-300 group-hover:translate-x-0.5", 
                    item.danger ? "text-red-300" : "text-gray-400"
                  )} 
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsMenuPage;

