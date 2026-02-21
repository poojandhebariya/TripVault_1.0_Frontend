import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface BottomNavModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: IconDefinition;
  children: React.ReactNode;
}

const BottomNavModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
}: BottomNavModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock / unlock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ── Bottom Sheet ── */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col
          rounded-t-3xl bg-white shadow-2xl
          transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ maxHeight: "85dvh" }}
      >
        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #7e22ce)",
                }}
              >
                <FontAwesomeIcon icon={icon} />
              </span>
            )}
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500
              hover:bg-gray-200 active:scale-90 transition-all duration-150"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomNavModal;
