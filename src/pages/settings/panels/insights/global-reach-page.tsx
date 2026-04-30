import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faMinus,
  faPlus,
  faRotateLeft,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import MobileStickyHeader from "../../../../components/mobile-sticky-header";

// ── Reach data (ISO numeric country codes) ────────────────────────────────────
type ReachLevel = "high" | "medium" | "low";

const REACH_DATA: Record<string, ReachLevel> = {
  "840": "high",   // USA
  "826": "high",   // UK
  "250": "high",   // France
  "356": "high",   // India
  "36":  "high",   // Australia
  "124": "high",   // Canada
  "276": "high",   // Germany
  "76":  "medium", // Brazil
  "392": "medium", // Japan
  "380": "medium", // Italy
  "724": "medium", // Spain
  "528": "medium", // Netherlands
  "410": "medium", // South Korea
  "484": "medium", // Mexico
  "784": "medium", // UAE
  "643": "low",    // Russia
  "156": "low",    // China
  "32":  "low",    // Argentina
  "710": "low",    // South Africa
  "818": "low",    // Egypt
  "792": "low",    // Turkey
  "360": "low",    // Indonesia
  "702": "low",    // Singapore
  "566": "low",    // Nigeria
};

const COLOR: Record<ReachLevel, string> = {
  high:   "#4f46e5",
  medium: "#7c3aed",
  low:    "#c4b5fd",
};
const NO_REACH  = "#f1f5f9";
const HOVER_CLR = "#1d4ed8";

const HIGH_COUNT   = Object.values(REACH_DATA).filter((v) => v === "high").length;
const MEDIUM_COUNT = Object.values(REACH_DATA).filter((v) => v === "medium").length;
const LOW_COUNT    = Object.values(REACH_DATA).filter((v) => v === "low").length;
const TOTAL        = HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT;

const W = 800;
const H = 450;

const GlobalReachPage = () => {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<{ id: string; d: string; name: string }[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const svgRef          = useRef<SVGSVGElement>(null);
  const dragging        = useRef(false);
  const lastPos         = useRef({ x: 0, y: 0 });

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
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
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
        {/* Summary Card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FontAwesomeIcon icon={faGlobe} className="text-lg" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{TOTAL} Countries</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Profile Reach</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(["high", "medium", "low"] as ReachLevel[]).map((level) => (
              <div
                key={level}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold text-gray-700"
                style={{ borderColor: COLOR[level] + "33", background: COLOR[level] + "08" }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR[level] }} />
                {level.toUpperCase()} ·{" "}
                {level === "high" ? HIGH_COUNT : level === "medium" ? MEDIUM_COUNT : LOW_COUNT}
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm relative group">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {[
              { icon: faPlus, action: handleZoomIn, title: "Zoom in" },
              { icon: faMinus, action: handleZoomOut, title: "Zoom out" },
              { icon: faRotateLeft, action: handleReset, title: "Reset View" },
            ].map(({ icon, action, title }) => (
              <button
                key={title}
                onClick={action}
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
              style={{
                left: tooltip.x,
                top: tooltip.y - 10,
                background: "#1e1b4b",
              }}
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
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}
                 style={{ transformOrigin: `${W / 2}px ${H / 2}px`, transition: dragging.current ? "none" : "transform 0.1s" }}>
                {paths.map(({ id, d, name }) => {
                  const level = REACH_DATA[id];
                  const isHovered = hovered === id;
                  const fill = isHovered ? HOVER_CLR : level ? COLOR[level] : NO_REACH;
                  
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
                        const scaleX = W / rect.width;
                        const scaleY = H / rect.height;
                        setTooltip({
                          x: (e.clientX - rect.left) * scaleX,
                          y: (e.clientY - rect.top)  * scaleY,
                          label: level
                            ? `${name} · ${level.charAt(0).toUpperCase() + level.slice(1)} Reach`
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
      </div>
    </div>
  );
};

export default GlobalReachPage;
