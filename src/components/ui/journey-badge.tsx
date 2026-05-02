import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faTimes, faStar } from "@fortawesome/free-solid-svg-icons";

// ── Types ─────────────────────────────────────────────────────────────────────
export type BadgeTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "legend"
  | "mythic";

export interface JourneyBadgeData {
  id: string;
  name: string;
  emoji: string;
  tier: BadgeTier;
  description: string;
  threshold: number;
  earned: boolean;
  seen?: boolean;
}

// ── Tier styles ───────────────────────────────────────────────────────────────
const TIER_STYLES: Record<
  BadgeTier,
  { ring: string; glow: string; bg: string; label: string; labelColor: string }
> = {
  bronze:   { ring: "#cd7f32", glow: "rgba(205,127,50,0.4)",  bg: "linear-gradient(135deg,#fdf3e7,#f5cfa0)",  label: "Bronze",   labelColor: "#92400e" },
  silver:   { ring: "#9ca3af", glow: "rgba(156,163,175,0.4)", bg: "linear-gradient(135deg,#f3f4f6,#d1d5db)",  label: "Silver",   labelColor: "#374151" },
  gold:     { ring: "#f59e0b", glow: "rgba(245,158,11,0.5)",  bg: "linear-gradient(135deg,#fffbeb,#fde68a)",  label: "Gold",     labelColor: "#92400e" },
  platinum: { ring: "#818cf8", glow: "rgba(129,140,248,0.5)", bg: "linear-gradient(135deg,#eef2ff,#c7d2fe)",  label: "Platinum", labelColor: "#3730a3" },
  diamond:  { ring: "#38bdf8", glow: "rgba(56,189,248,0.55)", bg: "linear-gradient(135deg,#e0f2fe,#7dd3fc)",  label: "Diamond",  labelColor: "#0c4a6e" },
  legend:   { ring: "#f43f5e", glow: "rgba(244,63,94,0.5)",   bg: "linear-gradient(135deg,#fff1f2,#fda4af)",  label: "Legend",   labelColor: "#881337" },
  mythic:   { ring: "#a855f7", glow: "rgba(168,85,247,0.6)",  bg: "linear-gradient(135deg,#faf5ff,#e879f9)",  label: "Mythic",   labelColor: "#581c87" },
};

// ── fmt helper ────────────────────────────────────────────────────────────────
const fmtKm = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString()}k km` : `${n} km`;

// ── Badge Card ────────────────────────────────────────────────────────────────
export const JourneyBadge = ({
  badge,
  size = "md",
}: {
  badge: JourneyBadgeData;
  size?: "sm" | "md" | "lg";
}) => {
  const s = TIER_STYLES[badge.tier];
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div
      className={`relative flex flex-col items-center text-center ${
        isLg ? "gap-3" : isSm ? "gap-1.5" : "gap-2"
      } ${badge.earned ? "" : "opacity-50 grayscale"}`}
    >
      {/* Hexagon badge shell */}
      <div
        className="relative flex items-center justify-center rounded-2xl transition-transform duration-300"
        style={{
          width:  isLg ? 88 : isSm ? 52 : 70,
          height: isLg ? 88 : isSm ? 52 : 70,
          background: badge.earned ? s.bg : "#f3f4f6",
          border: `2.5px solid ${badge.earned ? s.ring : "#d1d5db"}`,
          boxShadow: badge.earned
            ? `0 0 ${isLg ? 20 : 12}px ${s.glow}, 0 2px 8px rgba(0,0,0,0.08)`
            : "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Shine overlay */}
        {badge.earned && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, transparent 60%)",
            }}
          />
        )}

        {badge.earned ? (
          <span style={{ fontSize: isLg ? 38 : isSm ? 22 : 30 }}>{badge.emoji}</span>
        ) : (
          <FontAwesomeIcon
            icon={faLock}
            className="text-gray-300"
            style={{ fontSize: isLg ? 28 : isSm ? 16 : 22 }}
          />
        )}

        {/* Tier ribbon */}
        {badge.earned && (
          <span
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{
              background: s.bg,
              borderColor: s.ring,
              color: s.labelColor,
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </span>
        )}
      </div>

      {/* Text */}
      <div className={isSm ? "mt-1" : "mt-2"}>
        <p
          className={`font-bold text-gray-800 leading-tight ${
            isLg ? "text-sm" : isSm ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {badge.name}
        </p>
        {!isSm && (
          <p className="text-[9px] text-gray-400 mt-0.5 font-medium">
            {fmtKm(badge.threshold)}
          </p>
        )}
      </div>
    </div>
  );
};

export const BadgeCelebrationModal = ({
  badges,
  userName,
  onMarkSeen,
}: {
  badges: JourneyBadgeData[];
  userName?: string;
  onMarkSeen?: (id: string) => void;
}) => {
  const [queue, setQueue] = useState<JourneyBadgeData[]>([]);
  const [current, setCurrent] = useState<JourneyBadgeData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!badges.length) return;
    const newBadges = badges.filter((b) => b.earned && !b.seen);
    if (newBadges.length > 0) {
      setQueue(newBadges);
    }
  }, [badges]);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setCurrent(next);
      if (onMarkSeen) onMarkSeen(next.id);
      setTimeout(() => setVisible(true), 60);
    }
  }, [queue, current]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(null);
    }, 350);
  };

  if (!current) return null;
  const s = TIER_STYLES[current.tier];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={dismiss}
    >
      {/* Confetti-like sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              width: 6 + Math.random() * 6,
              height: 6 + Math.random() * 6,
              borderRadius: "50%",
              background: [s.ring, "#fbbf24", "#34d399", "#f472b6"][i % 4],
              top: `${5 + Math.random() * 90}%`,
              left: `${5 + Math.random() * 90}%`,
              animationDuration: `${0.8 + Math.random() * 1.2}s`,
              animationDelay: `${Math.random() * 0.5}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transition-all duration-350 ${
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xs" />
        </button>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
              key={i}
              icon={faStar}
              style={{ color: s.ring, fontSize: 14 + i * 1.5 }}
              className="animate-bounce"
              // stagger
            />
          ))}
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <JourneyBadge badge={current} size="lg" />
        </div>

        {/* Text */}
        <p
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-1"
          style={{ color: s.ring }}
        >
          Badge Unlocked!
        </p>
        <h2 className="text-xl font-black text-gray-900 mb-2">{current.name}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-1">
          {current.description}
        </p>
        {userName && (
          <p className="text-xs text-gray-400 mt-1">
            Congratulations, <span className="font-bold text-gray-600">{userName}</span>! 🎉
          </p>
        )}

        {/* CTA */}
        <button
          onClick={dismiss}
          className="mt-6 w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${s.ring}, ${s.ring}cc)` }}
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
};
