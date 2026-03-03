import { cn } from "../../lib/cn-merge";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

interface ToggleButtonGroupProps<T extends string = string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ToggleButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: ToggleButtonGroupProps<T>) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer outline-none",
              active
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default ToggleButtonGroup;
