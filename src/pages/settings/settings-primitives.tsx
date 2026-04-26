import { clsx } from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

/* ── Panel heading ── */
export const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-gray-900 mb-1">{children}</h2>
);

export const PanelSubtitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 mb-5">{children}</p>
);

/* ── Toggle switch ── */
export { default as Toggle } from "../../components/ui/toggle";

/* ── Row item ── */
interface RowItemProps {
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

export const RowItem = ({
  label,
  description,
  right,
  onClick,
  danger,
}: RowItemProps) => (
  <div
    onClick={onClick}
    className={clsx(
      "flex items-center justify-between py-4 border-b border-gray-100 last:border-0",
      onClick && "cursor-pointer group",
    )}
  >
    <div className="flex-1 min-w-0 pr-4">
      <p
        className={clsx(
          "text-sm font-semibold",
          danger ? "text-red-600" : "text-gray-800",
        )}
      >
        {label}
      </p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    {right ??
      (onClick && (
        <FontAwesomeIcon
          icon={faChevronRight}
          className={clsx(
            "text-xs transition-colors",
            danger
              ? "text-red-300 group-hover:text-red-500"
              : "text-gray-300 group-hover:text-gray-500",
          )}
        />
      ))}
  </div>
);

/* ── Card wrapper ── */
export const SettingsCard = ({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <div
    className={clsx(
      "bg-white rounded-2xl border shadow-sm px-5 divide-y divide-gray-100",
      danger ? "border-red-200" : "border-gray-200",
    )}
  >
    {children}
  </div>
);
