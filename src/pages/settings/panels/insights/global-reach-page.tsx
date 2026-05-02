import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faMinus,
  faPlus,
  faRotateLeft,
  faFire,
  faChartBar,
  faSignal,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";
import { userQueries } from "../../../../tanstack/user/queries";

// ── Types ───────────────────────────────────────────────────────────────────
type ReachLevel = "high" | "medium" | "low";

interface ReachEntry {
  country: string;
  count: number;
  level: ReachLevel;
}

// ── Country name → ISO numeric (world-atlas numeric IDs) ────────────────────
// This list covers the most common countries that appear in user data.
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "Afghanistan": "4", "Albania": "8", "Algeria": "12", "Argentina": "32",
  "Australia": "36", "Austria": "40", "Azerbaijan": "31", "Bangladesh": "50",
  "Belgium": "56", "Bolivia": "68", "Bosnia and Herzegovina": "70",
  "Brazil": "76", "Bulgaria": "100", "Cambodia": "116", "Cameroon": "120",
  "Canada": "124", "Chile": "152", "China": "156", "Colombia": "170",
  "Costa Rica": "188", "Croatia": "191", "Czech Republic": "203",
  "Czechia": "203", "Denmark": "208", "Ecuador": "218", "Egypt": "818",
  "Ethiopia": "231", "Finland": "246", "France": "250", "Germany": "276",
  "Ghana": "288", "Greece": "300", "Guatemala": "320", "Hungary": "348",
  "India": "356", "Indonesia": "360", "Iran": "364", "Iraq": "368",
  "Ireland": "372", "Israel": "376", "Italy": "380", "Japan": "392",
  "Jordan": "400", "Kazakhstan": "398", "Kenya": "404", "Kuwait": "414",
  "Lebanon": "422", "Libya": "434", "Malaysia": "458", "Mexico": "484",
  "Morocco": "504", "Myanmar": "104", "Nepal": "524", "Netherlands": "528",
  "New Zealand": "554", "Nigeria": "566", "Norway": "578", "Oman": "512",
  "Pakistan": "586", "Peru": "604", "Philippines": "608", "Poland": "616",
  "Portugal": "620", "Qatar": "634", "Romania": "642", "Russia": "643",
  "Russian Federation": "643", "Saudi Arabia": "682", "Serbia": "688",
  "Singapore": "702", "South Africa": "710", "South Korea": "410",
  "Republic of Korea": "410", "Spain": "724", "Sri Lanka": "144",
  "Sweden": "752", "Switzerland": "756", "Syria": "760", "Taiwan": "158",
  "Tanzania": "834", "Thailand": "764", "Tunisia": "788", "Turkey": "792",
  "Türkiye": "792", "Uganda": "800", "Ukraine": "804",
  "United Arab Emirates": "784", "UAE": "784",
  "United Kingdom": "826", "UK": "826",
  "United States": "840", "USA": "840", "United States of America": "840",
  "Uruguay": "858", "Uzbekistan": "860", "Venezuela": "862",
  "Vietnam": "704", "Yemen": "887", "Zimbabwe": "716",
};

// ── Colors ──────────────────────────────────────────────────────────────────
const COLOR: Record<ReachLevel, string> = {
  high:   "#4f46e5",
  medium: "#818cf8",
  low:    "#c4b5fd",
};
const NO_REACH  = "#f1f5f9";
const HOVER_CLR = "#1d4ed8";

const LEVEL_ICON: Record<ReachLevel, typeof faFire> = {
  high:   faFire,
  medium: faChartBar,
  low:    faSignal,
};

const W = 800;
const H = 450;

// ── Component ────────────────────────────────────────────────────────────────
const GlobalReachPage = () => {
  const { getReachStats } = userQueries();
  const { data: reachData = [], isLoading } = useQuery(getReachStats());

  // Build lookup: ISO numeric id → level
  const reachMap = useMemo<Record<string, ReachLevel>>(() => {
    const map: Record<string, ReachLevel> = {};
    reachData.forEach((entry) => {
      // Try direct name lookup first, then case-insensitive
      const iso =
        COUNTRY_NAME_TO_ISO[entry.country] ??
        COUNTRY_NAME_TO_ISO[
          Object.keys(COUNTRY_NAME_TO_ISO).find(
            (k) => k.toLowerCase() === entry.country.toLowerCase()
          ) ?? ""
        ];
      if (iso) map[iso] = entry.level;
    });
    return map;
  }, [reachData]);

  // Counts per level
  const highCount   = reachData.filter((r) => r.level === "high").length;
  const mediumCount = reachData.filter((r) => r.level === "medium").length;
  const lowCount    = reachData.filter((r) => r.level === "low").length;
  const total       = reachData.length;

  // Map state
  const [paths, setPaths] = useState<{ id: string; d: string; name: string }[]>([]);
  const [hovered, setHovered]   = useState<string | null>(null);
  const [tooltip, setTooltip]   = useState<{ x: number; y: number; label: string } | null>(null);
  const [zoom, setZoom]         = useState(1);
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const svgRef    = useRef<SVGSVGElement>(null);
  const dragging  = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo: any) => {
        const countries = feature(topo, topo.objects.countries as any);
        const projection = geoMercator().scale(120).translate([W / 2, H / 1.4]);
        const pathGen = geoPath(projection);
        const result = (countries.features as any[]).map((f) => {
          const id   = String((f as any).id ?? "");
          const name = (f.properties as any)?.name ?? id;
          return { id, name, d: pathGen(f as any) ?? "" };
        });
        setPaths(result);
      });
  }, []);

  const handleZoomIn  = () => setZoom((z) => Math.min(z + 0.4, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.4, 0.6));
  const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPan((p) => ({
      x: p.x + (e.clientX - lastPos.current.x),
      y: p.y + (e.clientY - lastPos.current.y),
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div className="min-h-screen bg-white md:bg-transparent animate-[slideDown_0.3s_ease-out]">
      <MobileStickyHeader title="Global Reach" />

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h2 className="text-lg font-bold text-gray-900">Global Reach</h2>
        <p className="text-xs text-gray-400">Top viewer demographics by region</p>
      </div>

      <div className="p-4 md:p-0 space-y-5">

        {/* ── Summary Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            </div>
            <div>
              {isLoading ? (
                <div className="h-6 w-28 bg-gray-100 rounded animate-pulse" />
              ) : (
                <p className="text-lg font-bold text-gray-900">{total} {total === 1 ? "Country" : "Countries"}</p>
              )}
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Total Audience Reach
              </p>
            </div>
          </div>

          {/* Legend chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["high", "medium", "low"] as ReachLevel[]).map((level) => {
              const count = level === "high" ? highCount : level === "medium" ? mediumCount : lowCount;
              return (
                <div
                  key={level}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold text-gray-700"
                  style={{ borderColor: COLOR[level] + "44", background: COLOR[level] + "0d" }}
                >
                  <FontAwesomeIcon icon={LEVEL_ICON[level]} style={{ color: COLOR[level] }} className="text-[10px]" />
                  <span style={{ color: COLOR[level] }}>{level.toUpperCase()}</span>
                  <span className="text-gray-400">·</span>
                  {isLoading ? (
                    <span className="w-4 h-3 bg-gray-100 rounded animate-pulse inline-block" />
                  ) : (
                    <span>{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Map ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm relative">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {[
              { icon: faPlus,       action: handleZoomIn,  title: "Zoom in" },
              { icon: faMinus,      action: handleZoomOut, title: "Zoom out" },
              { icon: faRotateLeft, action: handleReset,   title: "Reset View" },
            ].map(({ icon, action, title }) => (
              <button
                key={title}
                onClick={action}
                title={title}
                className="w-8 h-8 rounded-md bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-white hover:text-indigo-600 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={icon} className="text-xs" />
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 pointer-events-none px-2.5 py-1.5 rounded-md shadow-xl text-[10px] font-bold text-white -translate-x-1/2 -translate-y-full"
              style={{ left: tooltip.x, top: tooltip.y - 10, background: "#1e1b4b" }}
            >
              {tooltip.label}
            </div>
          )}

          <div className="bg-slate-50 cursor-grab active:cursor-grabbing" style={{ height: "400px" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${W} ${H}`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => { onMouseUp(); setHovered(null); setTooltip(null); }}
            >
              <g
                transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}
                style={{ transformOrigin: `${W / 2}px ${H / 2}px`, transition: dragging.current ? "none" : "transform 0.1s" }}
              >
                {paths.map(({ id, d, name }) => {
                  const level    = reachMap[id];
                  const isHov    = hovered === id;
                  const fill     = isHov ? HOVER_CLR : level ? COLOR[level] : NO_REACH;
                  // Find matching entry for tooltip count
                  const entry    = level ? reachData.find((r) => {
                    const iso = COUNTRY_NAME_TO_ISO[r.country] ??
                      COUNTRY_NAME_TO_ISO[Object.keys(COUNTRY_NAME_TO_ISO).find(
                        (k) => k.toLowerCase() === r.country.toLowerCase()
                      ) ?? ""];
                    return iso === id;
                  }) : undefined;

                  return (
                    <path
                      key={id}
                      d={d}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={0.5 / zoom}
                      className="transition-colors duration-150"
                      onMouseEnter={(e) => {
                        setHovered(id);
                        const rect = svgRef.current!.getBoundingClientRect();
                        setTooltip({
                          x: (e.clientX - rect.left) * (W / rect.width),
                          y: (e.clientY - rect.top)  * (H / rect.height),
                          label: level && entry
                            ? `${name} · ${level.charAt(0).toUpperCase() + level.slice(1)} · ${entry.count.toLocaleString()} views`
                            : name,
                        });
                      }}
                      onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                    />
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* ── Country List ─────────────────────────────────────────── */}
        {!isLoading && reachData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                All Audience Countries
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {reachData.map((entry, idx) => (
                <div key={entry.country} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-300 w-5 text-right">{idx + 1}</span>
                    <span className="text-sm font-semibold text-gray-800">{entry.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">
                      {entry.count.toLocaleString()} {entry.count === 1 ? "view" : "views"}
                    </span>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        color: COLOR[entry.level],
                        background: COLOR[entry.level] + "1a",
                      }}
                    >
                      {entry.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ───────────────────────────────────────────── */}
        {!isLoading && reachData.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faGlobe} className="text-2xl text-indigo-300" />
            </div>
            <p className="font-bold text-gray-700 text-sm">No audience data yet</p>
            <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
              Countries will appear here once people start viewing your vaults.
            </p>
          </div>
        )}

        {/* ── Loading Skeleton ─────────────────────────────────────── */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default GlobalReachPage;
