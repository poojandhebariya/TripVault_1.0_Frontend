import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn-merge";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: IconDefinition;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
  variant?: "center" | "bottom";
}

const Modal = ({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  className,
  variant = "center",
}: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle mounting and animation sequence
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // Small delay to ensure browser paints first state before transition starts
      const timer = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Wait for transition duration before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Lock / unlock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full m-4",
  };

  const isBottom = variant === "bottom";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex overflow-hidden",
        isBottom ? "items-end" : "items-center justify-center p-4 sm:p-6",
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-out",
          isBottom
            ? cn(
                "rounded-t-3xl flex flex-col",
                isAnimating ? "translate-y-0" : "translate-y-full",
              )
            : cn(
                "rounded-2xl",
                sizeClasses[size],
                isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
              ),
          className,
        )}
        style={isBottom ? { maxHeight: "85dvh" } : undefined}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle pill for bottom sheet */}
        {isBottom && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Header */}
        {(title || icon || showCloseButton) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                  <FontAwesomeIcon icon={icon} className="text-white text-sm" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            "px-6 py-5",
            isBottom && "overflow-y-auto overscroll-contain flex-1",
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
