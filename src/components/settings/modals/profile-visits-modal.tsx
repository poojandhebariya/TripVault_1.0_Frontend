import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

// ── Dummy yearly visit data ───────────────────────────────────────────────────
const YEARLY_DATA = [
  { year: "2020", visits: 214 },
  { year: "2021", visits: 389 },
  { year: "2022", visits: 576 },
  { year: "2023", visits: 843 },
  { year: "2024", visits: 1102 },
  { year: "2025", visits: 1248 },
];

const TOTAL_VISITS = YEARLY_DATA.reduce((sum, d) => sum + d.visits, 0);
const MAX_VISITS = Math.max(...YEARLY_DATA.map((d) => d.visits));
const GROWTH_PCT = Math.round(
  ((YEARLY_DATA.at(-1)!.visits - YEARLY_DATA.at(-2)!.visits) /
    YEARLY_DATA.at(-2)!.visits) *
    100
);

// ── Single Bar ────────────────────────────────────────────────────────────────
const Bar = ({
  item,
  isActive,
  onHover,
  onLeave,
}: {
  item: (typeof YEARLY_DATA)[0];
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const heightPct = (item.visits / MAX_VISITS) * 100;

  return (
    // relative + fixed height so tooltip never shifts the layout
    <div
      className="relative flex flex-col items-center flex-1 cursor-pointer"
      style={{ height: "220px" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Absolutely-positioned tooltip — never contributes to column height */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10
          text-[11px] font-bold text-white px-2 py-1 rounded-md shadow-md
          whitespace-nowrap pointer-events-none transition-all duration-150 ${
            isActive ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        style={{ background: "linear-gradient(to right,#1d4ed8,#6b21a8)" }}
      >
        {item.visits.toLocaleString()}
      </div>

      {/* Bar track — fills from the bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex items-end justify-center" style={{ height: "160px" }}>
        <div
          className="w-full rounded-t-md transition-all duration-500 ease-out"
          style={{
            height: `${heightPct}%`,
            background: isActive
              ? "linear-gradient(to top,#1d4ed8,#6b21a8)"
              : "linear-gradient(to top,#bfdbfe,#e9d5ff)",
            boxShadow: isActive
              ? "0 4px 16px rgba(29,78,216,0.3)"
              : "none",
          }}
        />
      </div>

      {/* Year label — pinned at the bottom */}
      <span
        className={`absolute bottom-0 text-xs font-semibold transition-colors duration-200 ${
          isActive ? "text-blue-700" : "text-gray-400"
        }`}
      >
        {item.year}
      </span>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const ProfileVisitsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Profile Visits"
      description="Year-wise breakdown of unique traveler visits"
      icon={faUsers}
      size="lg"
    >
      <div className="space-y-5">
        {/* ── Summary row ── */}
        <div className="flex items-stretch gap-4">
          <div className="flex-1 rounded-2xl p-4 border border-blue-100 bg-blue-50">
            <p className="text-xs text-gray-400 font-medium mb-1">Total Visits</p>
            <p className="text-3xl font-extrabold gradient-text">
              {TOTAL_VISITS.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">all time</p>
          </div>
          <div className="flex-1 rounded-2xl p-4 border border-purple-100 bg-purple-50">
            <p className="text-xs text-gray-400 font-medium mb-1">YoY Growth</p>
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-purple-600 text-lg" />
              <p className="text-3xl font-extrabold gradient-text">+{GROWTH_PCT}%</p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">vs last year</p>
          </div>
        </div>

        {/* ── Bar Chart ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Yearly Breakdown
          </p>
          {/* Fixed-height wrapper so hovering never resizes the modal */}
          <div className="flex items-stretch gap-2" style={{ height: "220px" }}>
            {YEARLY_DATA.map((item, idx) => (
              <Bar
                key={item.year}
                item={item}
                isActive={activeIndex === idx}
                onHover={() => setActiveIndex(idx)}
                onLeave={() => setActiveIndex(null)}
              />
            ))}
          </div>
        </div>

        {/* ── Detail row — fixed height so no layout shift ── */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-14 flex items-center">
          {activeIndex !== null ? (
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {YEARLY_DATA[activeIndex].year}
                </p>
                <p className="text-xs text-gray-400">
                  {YEARLY_DATA[activeIndex].visits.toLocaleString()} unique visitors
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white shrink-0"
                style={{ background: "linear-gradient(to right,#1d4ed8,#6b21a8)" }}
              >
                {((YEARLY_DATA[activeIndex].visits / TOTAL_VISITS) * 100).toFixed(1)}%
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 w-full text-center">
              Hover over a bar to see details
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
