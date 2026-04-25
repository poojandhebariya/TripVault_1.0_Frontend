import { clsx } from "clsx";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

/**
 * Accessible on/off switch.
 * Use ToggleButtonGroup (toggle-button.tsx) when you need a segmented multi-option picker.
 */
const Toggle = ({ enabled, onChange, disabled = false }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    disabled={disabled}
    onClick={() => !disabled && onChange(!enabled)}
    className={clsx(
      "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      enabled ? "bg-gradient-to-r from-blue-600 to-purple-700" : "bg-gray-200",
    )}
  >
    <span
      className={clsx(
        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
        enabled && "translate-x-5",
      )}
    />
  </button>
);

export default Toggle;
