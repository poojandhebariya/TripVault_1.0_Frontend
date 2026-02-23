import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMagnifyingGlassMinus,
} from "@fortawesome/free-solid-svg-icons";

interface ImagePreviewModalProps {
  src: string | undefined;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const WHEEL_SENSITIVITY = 0.001;

/**
 * Full-screen image preview modal with isolated zoom.
 * - Mouse wheel: zoom image only (backdrop stays fixed)
 * - Pinch gesture: zoom image only
 * - Drag: pan when zoomed in
 * - Double-click / double-tap: reset zoom
 * - Backdrop click: close (only when not zoomed)
 * - Escape key: close
 */
const ImagePreviewModal = ({
  src,
  alt = "Preview",
  isOpen,
  onClose,
}: ImagePreviewModalProps) => {
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Refs for gesture state (not in state to avoid re-renders during fast events)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastTapTime = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // ── Open / close animation ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      // Reset zoom after the closing animation finishes
      setTimeout(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
      }, 300);
    }
  }, [isOpen]);

  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // ── Clamp offset so the image never drifts outside its bounds ────────────
  const clampOffset = useCallback(
    (nextScale: number, nextOffset: { x: number; y: number }) => {
      const el = imgContainerRef.current;
      if (!el) return nextOffset;
      const imgEl = el.querySelector("img");
      if (!imgEl) return nextOffset;
      const rect = imgEl.getBoundingClientRect();
      const maxX = Math.max(
        0,
        (rect.width * nextScale - window.innerWidth) / 2,
      );
      const maxY = Math.max(
        0,
        (rect.height * nextScale - window.innerHeight) / 2,
      );
      return {
        x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
        y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
      };
    },
    [],
  );

  // ── Mouse wheel → zoom image (prevent page scroll / browser zoom) ────────
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setScale((prev) => {
        const delta = -e.deltaY * WHEEL_SENSITIVITY;
        const next = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, prev + delta * prev),
        );
        setOffset((o) => clampOffset(next, o));
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clampOffset, isOpen]);

  // ── Mouse drag (pan when zoomed) ─────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetAtDragStart.current = offset;
    e.currentTarget.setAttribute("style", "cursor: grabbing");
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const next = {
      x: offsetAtDragStart.current.x + dx,
      y: offsetAtDragStart.current.y + dy,
    };
    setOffset(clampOffset(scale, next));
  };

  const onMouseUp = (e: React.MouseEvent) => {
    isDragging.current = false;
    e.currentTarget.setAttribute("style", "");
  };

  // ── Double-click → reset zoom ─────────────────────────────────────────────
  const onDoubleClick = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Touch: pinch-to-zoom + drag + double-tap ──────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Start of pinch gesture
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      // Single touch — drag setup
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      offsetAtDragStart.current = offset;
      // Double-tap detection
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        setScale(1);
        setOffset({ x: 0, y: 0 });
      }
      lastTapTime.current = now;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent browser native pinch-zoom on the whole page
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist.current !== null) {
        const ratio = dist / lastPinchDist.current;
        setScale((prev) => {
          const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * ratio));
          setOffset((o) => clampOffset(next, o));
          return next;
        });
      }
      lastPinchDist.current = dist;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single-touch pan
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      const next = {
        x: offsetAtDragStart.current.x + dx,
        y: offsetAtDragStart.current.y + dy,
      };
      setOffset(clampOffset(scale, next));
    }
  };

  const onTouchEnd = () => {
    lastPinchDist.current = null;
  };

  // ── Backdrop click closes only when not zoomed ───────────────────────────
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && scale <= 1) onClose();
  };

  if (!isOpen && !visible) return null;

  const isZoomed = scale > 1.01;

  return (
    // Backdrop — never transforms or zooms
    <div
      ref={overlayRef}
      onClick={onBackdropClick}
      className={`fixed inset-0 z-999 flex items-center justify-center transition-all duration-300 select-none ${
        visible
          ? "bg-black/85 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
        aria-label="Close preview"
      >
        <FontAwesomeIcon icon={faXmark} className="text-base" />
      </button>

      {/* Reset zoom button — shown only when zoomed */}
      {isZoomed && (
        <button
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer backdrop-blur-sm"
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          Reset zoom
        </button>
      )}

      {/* Image container — this is the layer that gets transformed */}
      <div
        ref={imgContainerRef}
        className="flex items-center justify-center w-full h-full overflow-hidden"
        style={{ touchAction: "none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-xl object-contain shadow-2xl transition-[opacity,scale] duration-300 ${
            isZoomed ? "cursor-grab" : "cursor-zoom-in"
          } ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            // Only animate opacity/entry — not the zoom transform (would feel laggy)
            transition:
              scale === 1 && offset.x === 0 && offset.y === 0
                ? "opacity 0.3s, transform 0.3s"
                : "opacity 0.3s",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
