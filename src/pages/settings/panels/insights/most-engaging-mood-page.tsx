import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faLightbulb,
  faStar,
  faLayerGroup,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";
import { userQueries } from "../../../../tanstack/user/queries";
import { MOODS } from "../../../../utils/moods";

// ── Helpers ────────────────────────────────────────────────────────────────────
const getMoodMeta = (id: string) =>
  MOODS.find(
    (m) => m.id === id.toLowerCase() || m.label.toLowerCase() === id.toLowerCase()
  );

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : `${n}`;

// Palette for moods not in the standard list (fallback)
const FALLBACK_COLORS = [
  { ring: "#f97316", bg: "from-orange-400 to-red-500" },
  { ring: "#06b6d4", bg: "from-sky-400 to-blue-500" },
  { ring: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { ring: "#ec4899", bg: "from-pink-400 to-rose-500" },
  { ring: "#10b981", bg: "from-green-400 to-emerald-500" },
  { ring: "#f59e0b", bg: "from-amber-400 to-yellow-500" },
];

// ── Skeleton ───────────────────────────────────────────────────────────────────
const MoodSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="h-32 rounded-2xl bg-gray-200" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-100" />
      ))}
    </div>
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300 text-2xl mb-4 shadow-sm">
      <FontAwesomeIcon icon={faStar} />
    </div>
    <p className="text-sm font-bold text-gray-700">No mood data yet</p>
    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
      Publish vaults with a trip mood assigned and your vibe breakdown will appear here.
    </p>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const MostEngagingMoodPage = () => {
  const { getMoodStats } = userQueries();
  const { data: moods = [], isLoading } = useQuery(getMoodStats());

  const top = moods[0];
  const topMeta = top ? getMoodMeta(top.id) : null;
  const topColor = topMeta
    ? { ring: "#f97316", bg: topMeta.bg }
    : FALLBACK_COLORS[0];

  const fastestGrowing = moods.reduce(
    (best, m) => (m.impressions > (best?.impressions ?? 0) ? m : best),
    moods[0]
  );

  return (
    <div className="bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Engaging Mood" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Content Vibe</h2>
        <p className="text-xs text-gray-400">
          The trip vibe that resonates most with your audience
        </p>
      </div>

      <div className="p-4 md:p-0 space-y-5">
        {isLoading ? (
          <MoodSkeleton />
        ) : moods.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Top Mood Hero Card ─────────────────────────────────────── */}
            <div
              className={`bg-gradient-to-br ${topColor.bg} rounded-lg p-6 text-white relative overflow-hidden shadow-md`}
            >
              <div className="absolute -right-4 -bottom-4 text-white/10 text-[80px] leading-none select-none pointer-events-none">
                {topMeta?.emoji ?? "✨"}
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest mb-4 border border-white/30">
                  <FontAwesomeIcon icon={faFire} className="text-yellow-200" />
                  Reigning Vibe
                </div>
                <h3 className="text-2xl font-black mb-1 capitalize">
                  {topMeta?.label ?? top.label}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
                    {top.vaultCount} vault{top.vaultCount !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                    <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                    {fmt(top.impressions)} impressions
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/70 rounded-full transition-all duration-1000"
                    style={{ width: `${top.engagementPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/60 mt-1">
                  {top.engagementPct}% engagement share
                </p>
              </div>
            </div>

            {/* ── Breakdown Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moods.map((item, idx) => {
                const meta = getMoodMeta(item.id);
                const color = meta
                  ? FALLBACK_COLORS[MOODS.findIndex((m) => m.id === meta.id) % FALLBACK_COLORS.length]
                  : FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${meta?.bg ?? "from-gray-400 to-gray-500"}`}
                        >
                          {meta?.emoji ?? "✈️"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 capitalize">
                            {meta?.label ?? item.label}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {item.vaultCount} vault{item.vaultCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-base font-black"
                          style={{ color: color.ring }}
                        >
                          {item.engagementPct}%
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          {fmt(item.impressions)} views
                        </p>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${item.engagementPct}%`,
                          background: `linear-gradient(90deg, ${color.ring}cc, ${color.ring})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Tip Box ────────────────────────────────────────────────── */}
            {fastestGrowing && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <FontAwesomeIcon icon={faLightbulb} className="text-xs" />
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-indigo-900 mb-0.5 uppercase tracking-wide">
                    Growth Tip
                  </h5>
                  <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                    Your{" "}
                    <span className="font-bold text-indigo-900 capitalize">
                      {getMoodMeta(fastestGrowing.id)?.label ?? fastestGrowing.label}
                    </span>{" "}
                    {getMoodMeta(fastestGrowing.id)?.emoji ?? "✨"} vaults have accumulated{" "}
                    <span className="font-bold text-indigo-900">
                      {fmt(fastestGrowing.impressions)} impressions
                    </span>
                    . Keep posting more of this vibe to maximise your reach!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MostEngagingMoodPage;
