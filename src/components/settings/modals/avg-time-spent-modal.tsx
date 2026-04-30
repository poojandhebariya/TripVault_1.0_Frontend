import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

// ── Dummy per-vault breakdown data ────────────────────────────────────────────
const VAULT_BREAKDOWN = [
  { title: "Santorini Sunsets",     time: "4m 12s", pct: 84 },
  { title: "Kyoto Cherry Blossoms", time: "3m 58s", pct: 79 },
  { title: "Iceland Road Trip",     time: "3m 20s", pct: 66 },
  { title: "Bali Hidden Temples",   time: "2m 45s", pct: 55 },
  { title: "Swiss Alps Hiking",     time: "1m 55s", pct: 38 },
];

const AVG_TIME   = "2m 45s"; // overall average
const INDUSTRY   = "1m 29s"; // benchmark
const MAX_MINS   = 5;        // scale max (5 min)
const YOUR_PCT   = 55;       // 2m45s / 5m
const IND_PCT    = 29.7;     // 1m29s / 5m
const GROWTH_PCT = 85;       // vs industry average

// ── Modal ─────────────────────────────────────────────────────────────────────
export const AvgTimeSpentModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Avg. Time Spent"
      description="How long visitors engage with your vaults"
      icon={faClock}
      size="lg"
    >
      <div className="space-y-5">
        {/* ── Summary cards ── */}
        <div className="flex items-stretch gap-4">
          <div className="flex-1 rounded-2xl p-4 border border-blue-100 bg-blue-50">
            <p className="text-xs text-gray-400 font-medium mb-1">Your Average</p>
            <p className="text-3xl font-extrabold gradient-text">{AVG_TIME}</p>
            <p className="text-xs text-gray-400 mt-0.5">per session</p>
          </div>
          <div className="flex-1 rounded-2xl p-4 border border-emerald-100 bg-emerald-50">
            <p className="text-xs text-gray-400 font-medium mb-1">vs Industry</p>
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-emerald-600 text-lg" />
              <p className="text-3xl font-extrabold gradient-text">+{GROWTH_PCT}%</p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">above avg · {INDUSTRY}</p>
          </div>
        </div>

        {/* ── Engagement bar ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Engagement Scale
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>0s</span>
              <span>Industry avg · {INDUSTRY}</span>
              <span>{MAX_MINS}m</span>
            </div>
            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              {/* Industry average marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
                style={{ left: `${IND_PCT}%` }}
              />
              {/* Your fill */}
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${YOUR_PCT}%`,
                  background: "linear-gradient(to right,#1d4ed8,#6b21a8)",
                }}
              />
            </div>
            {/* Pointer label under your fill */}
            <div className="relative" style={{ height: "16px" }}>
              <div
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${YOUR_PCT}%` }}
              >
                <div className="w-0.5 h-2 bg-purple-400" />
                <span className="text-[10px] font-bold gradient-text whitespace-nowrap">
                  You · {AVG_TIME}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Per-vault breakdown ── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Top Vaults by Engagement
          </p>
          <ul className="space-y-3">
            {VAULT_BREAKDOWN.map((vault, i) => (
              <li key={vault.title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[65%]">
                    {i + 1}. {vault.title}
                  </span>
                  <span className="text-xs font-bold gradient-text shrink-0 ml-2">
                    {vault.time}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${vault.pct}%`,
                      background: "linear-gradient(to right,#1d4ed8,#6b21a8)",
                      opacity: 1 - i * 0.1,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};
