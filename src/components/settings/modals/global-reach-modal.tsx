import { useState, useEffect, useRef, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faMinus,
  faPlus,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";

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

// ── Map dimensions ────────────────────────────────────────────────────────────
const W = 600;
const H = 320;

// ── Modal ─────────────────────────────────────────────────────────────────────
export const GlobalReachModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [paths, setPaths] = useState<{ id: string; d: string; name: string }[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const svgRef          = useRef<SVGSVGElement>(null);
  const dragging        = useRef(false);
  const lastPos         = useRef({ x: 0, y: 0 });

  // Fetch & project once
  useEffect(() => {
    if (!open || paths.length) return;
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then((topo: any) => {
        const countries = feature(
          topo,
          topo.objects.countries as any
        );
        const projection = geoMercator()
          .scale(90)
          .translate([W / 2, H / 1.5]);
        const pathGen = geoPath(projection);
        const result = (countries.features as any[]).map((f) => {
          const id   = String((f as any).id ?? "");
          const name = (f.properties as any)?.name ?? id;
          return { id, name, d: pathGen(f as any) ?? "" };
        });
        setPaths(result);
      });
  }, [open, paths.length]);

  // ── Zoom helpers ─────────────────────────────────────────────────────────────
  const handleZoomIn  = () => setZoom((z) => Math.min(z + 0.4, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.4, 0.6));
  const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── Pan (drag) ────────────────────────────────────────────────────────────────
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
    <Modal
      open={open}
      onClose={onClose}
      title="Global Reach"
      description={`Your content reached travellers in ${TOTAL} countries`}
      icon={faGlobe}
      size="xl"
    >
      <div className="space-y-4">
        {/* Legend pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["high", "medium", "low"] as ReachLevel[]).map((level) => (
            <div
              key={level}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold text-gray-700"
              style={{ borderColor: COLOR[level] + "55", background: COLOR[level] + "18" }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR[level] }} />
              {level.charAt(0).toUpperCase() + level.slice(1)} ·{" "}
              {level === "high" ? HIGH_COUNT : level === "medium" ? MEDIUM_COUNT : LOW_COUNT}
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            No reach
          </div>
        </div>

        {/* Map */}
        <div className="relative rounded-2xl border border-gray-100 bg-slate-50 overflow-hidden select-none" style={{ height: `${H}px` }}>
          {/* Zoom controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {[
              { icon: faPlus, action: handleZoomIn, title: "Zoom in" },
              { icon: faMinus, action: handleZoomOut, title: "Zoom out" },
              { icon: faRotateLeft, action: handleReset, title: "Reset" },
            ].map(({ icon, action, title }) => (
              <button
                key={title}
                type="button"
                onClick={action}
                title={title}
                className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={icon} className="text-xs" />
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-20 pointer-events-none text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg shadow-md -translate-x-1/2 -translate-y-full"
              style={{
                left: tooltip.x,
                top: tooltip.y - 6,
                background: "linear-gradient(to right,#1d4ed8,#6b21a8)",
              }}
            >
              {tooltip.label}
            </div>
          )}

          {/* SVG world map */}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            style={{ cursor: dragging.current ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { onMouseUp(); setHovered(null); setTooltip(null); }}
          >
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom}) translate(${(W / 2) * (1 - 1 / zoom) * -1 / zoom * 0},0)`}
               style={{ transformOrigin: `${W / 2}px ${H / 2}px` }}>
              {paths.map(({ id, d, name }) => {
                const level = REACH_DATA[id];
                const fill  = hovered === id
                  ? HOVER_CLR
                  : level ? COLOR[level] : NO_REACH;
                return (
                  <path
                    key={id}
                    d={d}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.5 / zoom}
                    style={{ transition: "fill 0.15s ease", cursor: level ? "pointer" : "default" }}
                    onMouseEnter={(e) => {
                      setHovered(id);
                      const rect = svgRef.current!.getBoundingClientRect();
                      const scaleX = W / rect.width;
                      const scaleY = H / rect.height;
                      setTooltip({
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top)  * scaleY,
                        label: level
                          ? `${name} · ${level.charAt(0).toUpperCase() + level.slice(1)}`
                          : `${name} · No reach`,
                      });
                    }}
                    onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Hint */}
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
            Drag to pan · Use + / − to zoom
          </p>
        </div>
      </div>
    </Modal>
  );
};
