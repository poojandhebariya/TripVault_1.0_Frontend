import { NavLink, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faLock,
  faPalette,
  faTriangleExclamation,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import { ROUTES } from "../../utils/constants";

const NAV_ITEMS = [
  {
    to: ROUTES.USER.SETTINGS_SECURITY,
    label: "Security",
    icon: faShield,
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_PRIVACY,
    label: "Privacy",
    icon: faLock,
    danger: false,
  },
  // {
  //   to: ROUTES.USER.SETTINGS_APPEARANCE,
  //   label: "Appearance",
  //   icon: faPalette,
  //   danger: false,
  // },
  {
    to: ROUTES.USER.SETTINGS_INSIGHTS,
    label: "Insights",
    icon: faChartLine,
    danger: false,
  },
  {
    to: ROUTES.USER.SETTINGS_DANGER,
    label: "Danger Zone",
    icon: faTriangleExclamation,
    danger: true,
  },
] as const;

/**
 * Desktop  → two-column layout: NavLink sidebar (left) + panel content (right).
 * Mobile   → no sidebar; each panel renders its own MobileStickyHeader with a
 *             back button that returns to the settings menu page.
 *             The index route renders SettingsMenuPage (see app-routes.tsx).
 */
const SettingsLayout = () => {
  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      {/* Desktop page title — hidden on mobile */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account, security and preferences.
        </p>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 flex flex-col md:flex-row gap-4 md:gap-8">

        {/* ── Left sidebar: desktop only ── */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="sticky top-6 flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon, danger }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100 whitespace-nowrap cursor-pointer",
                    isActive
                      ? danger
                        ? "bg-red-50 text-red-600 font-semibold"
                        : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold border border-blue-100"
                      : danger
                        ? "text-red-400 hover:bg-red-50 hover:text-red-600"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={clsx(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-100",
                        isActive
                          ? danger
                            ? "bg-red-100 text-red-500"
                            : "bg-gradient-to-br from-blue-600 to-purple-700 text-white"
                          : danger
                            ? "bg-red-50 text-red-400"
                            : "bg-gray-100 text-gray-400",
                      )}
                    >
                      <FontAwesomeIcon icon={icon} className="text-xs" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Right panel — child route renders here ── */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>

      <p className="text-center text-xs text-gray-300 mt-10 hidden md:block">
        TripVault v1.0
      </p>
    </div>
  );
};

export default SettingsLayout;
