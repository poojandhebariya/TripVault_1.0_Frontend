import { cn } from "../lib/cn-merge";
import { MOODS } from "../utils/moods";

interface MoodPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

const MoodPicker = ({ value, onChange }: MoodPickerProps) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
    {MOODS.map((m) => {
      const active = value === m.id;
      return (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(active ? null : m.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all duration-200 cursor-pointer",
            active
              ? `border-transparent bg-linear-to-br ${m.bg} shadow-sm`
              : "border-gray-100 bg-gray-50 hover:border-gray-200",
          )}
        >
          <span className="text-xl leading-none">{m.emoji}</span>
          <span
            className={cn(
              "text-[11px] font-semibold leading-tight text-center",
              active ? "text-white" : "text-gray-500",
            )}
          >
            {m.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default MoodPicker;
