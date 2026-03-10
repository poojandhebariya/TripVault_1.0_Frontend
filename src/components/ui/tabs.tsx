import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn-merge";
import React from "react";

export interface TabItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: TabItem[];
  className?: string;
}

const Tabs = ({ tabs, className }: ProfileTabsProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (route: string) => pathname === route;

  // Redirect to first tab when no tab route is currently active
  useEffect(() => {
    const anyActive = tabs.some((t) => t.route === pathname);
    if (!anyActive && tabs.length > 0) {
      navigate(tabs[0].route, { replace: true });
    }
  }, [pathname, tabs, navigate]);

  return (
    <div
      className={cn(
        "border-b border-gray-200 bg-white animate-[slideDown_0.3s_ease-out]",
        className,
      )}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <button
              key={tab.route}
              onClick={() => navigate(tab.route)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer",
                !active && "text-gray-400 hover:text-gray-700",
                active && "text-gray-900",
              )}
            >
              {tab.icon && (
                <span
                  className={cn(
                    "text-[13px]",
                    active ? "opacity-100" : "opacity-50",
                  )}
                >
                  {tab.icon}
                </span>
              )}

              {tab.label}

              <span
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200",
                  active
                    ? "bg-gray-900 opacity-100"
                    : "bg-transparent opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;

/* ── State-driven tabs (same visual style, no routing) ──────────────────── */

export interface StateTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface StateTabsProps {
  tabs: StateTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const StateTabs = ({
  tabs,
  activeTab,
  onChange,
  className,
}: StateTabsProps) => (
  <div className={cn("border-b border-gray-200 bg-white", className)}>
    <div className="flex">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer",
              !active && "text-gray-400 hover:text-gray-700",
              active && "text-gray-900",
            )}
          >
            {tab.icon && (
              <span
                className={cn(
                  "text-[13px]",
                  active ? "opacity-100" : "opacity-50",
                )}
              >
                {tab.icon}
              </span>
            )}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                  active
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {tab.badge}
              </span>
            )}
            <span
              className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200",
                active ? "bg-gray-900 opacity-100" : "bg-transparent opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  </div>
);
