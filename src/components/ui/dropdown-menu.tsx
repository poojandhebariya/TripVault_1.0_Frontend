import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { cn } from "../../lib/cn-merge";

export interface DropdownMenuItem {
  label: string;
  icon?: IconProp;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  trigger: ReactNode | ((isOpen: boolean) => ReactNode);
  items: DropdownMenuItem[];
  align?: "left" | "right";
  width?: string;
  showAccentBar?: boolean;
}

const DropdownMenu = ({
  trigger,
  items,
  align = "right",
  width = "w-48",
  showAccentBar = true,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderTrigger = () => {
    if (typeof trigger === "function") {
      return trigger(isOpen);
    }
    return trigger;
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{renderTrigger()}</div>

      <div
        className={cn(
          "absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200",
          align === "right"
            ? "right-0 origin-top-right"
            : "left-0 origin-top-left",
          width,
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        {showAccentBar && (
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(to right, #0219b3, #7d0299)",
            }}
          />
        )}

        <div className="py-1.5">
          {items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 text-left cursor-pointer",
                item.variant === "danger"
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              {item.icon && (
                <FontAwesomeIcon
                  icon={item.icon}
                  className={cn(
                    "w-3.5 shrink-0",
                    item.variant === "danger"
                      ? "text-red-400"
                      : "text-gray-400",
                  )}
                />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
