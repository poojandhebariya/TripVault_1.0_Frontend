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
  // swipe-down-to-close state
  const [swipeDy, setSwipeDy] = useState(0);

  // Refs for gesture state (not in state to avoid re-renders during fast events)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetAtDragStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const lastTapTime = useRef(0);
  // swipe-to-close tracking
  const swipeStartY = useRef<number | null>(null);
  const swipeStartTime = useRef(0);
  const isSwipeCandidate = useRef(false);
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
      // Start of pinch gesture — not a swipe
      isSwipeCandidate.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      // Single touch — drag setup + swipe-to-close setup
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      offsetAtDragStart.current = offset;
      // Swipe-to-close only when not zoomed
      if (scale <= 1) {
        swipeStartY.current = e.touches[0].clientY;
        swipeStartTime.current = Date.now();
        isSwipeCandidate.current = true;
      } else {
        isSwipeCandidate.current = false;
      }
      // Double-tap detection
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        setScale(1);
        setOffset({ x: 0, y: 0 });
        isSwipeCandidate.current = false;
      }
      lastTapTime.current = now;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent browser native pinch-zoom on the whole page
    if (e.touches.length === 2) {
      // Pinch zoom
      isSwipeCandidate.current = false;
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
    } else if (e.touches.length === 1) {
      const currentY = e.touches[0].clientY;

      // Swipe-to-close: track vertical drag visually (only when not zoomed)
      if (
        isSwipeCandidate.current &&
        swipeStartY.current !== null &&
        scale <= 1
      ) {
        const dy = currentY - swipeStartY.current;
        // Downward drag only — start tracking once past 5px to avoid jitter
        if (dy > 5) {
          setSwipeDy(dy);
          return; // don't pan while doing swipe-to-close
        }
        // If user moved horizontally / up, cancel swipe
        const dx = Math.abs(e.touches[0].clientX - dragStart.current.x);
        if (dx > 10) {
          isSwipeCandidate.current = false;
          setSwipeDy(0);
        }
      }

      // Single-touch pan (when zoomed)
      if (scale > 1) {
        const dx2 = e.touches[0].clientX - dragStart.current.x;
        const dy2 = e.touches[0].clientY - dragStart.current.y;
        const next = {
          x: offsetAtDragStart.current.x + dx2,
          y: offsetAtDragStart.current.y + dy2,
        };
        setOffset(clampOffset(scale, next));
      }
    }
  };

  const SWIPE_CLOSE_THRESHOLD = 80; // px
  const SWIPE_VELOCITY_THRESHOLD = 0.4; // px/ms

  const onTouchEnd = () => {
    lastPinchDist.current = null;

    if (isSwipeCandidate.current && swipeDy > 0) {
      const elapsed = Date.now() - swipeStartTime.current;
      const velocity = swipeDy / Math.max(elapsed, 1);
      if (
        swipeDy >= SWIPE_CLOSE_THRESHOLD ||
        velocity >= SWIPE_VELOCITY_THRESHOLD
      ) {
        // Close the preview
        setSwipeDy(0);
        onClose();
      } else {
        // Snap back
        setSwipeDy(0);
      }
    }

    isSwipeCandidate.current = false;
    swipeStartY.current = null;
  };

  // ── Click image to close (when not zoomed) ─────────────────────────────────
  const onImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't also fire backdrop click
    if (scale <= 1) onClose();
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
          onClick={onImageClick}
          className={`max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-xl object-contain shadow-2xl ${
            isZoomed ? "cursor-grab" : "cursor-pointer"
          } ${visible ? "opacity-100" : "opacity-0"}`}
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px) translateY(${swipeDy}px)`,
            transition:
              swipeDy > 0
                ? "none" // no transition while finger is dragging
                : scale === 1 && offset.x === 0 && offset.y === 0
                  ? "opacity 0.3s, transform 0.35s cubic-bezier(0.32,0.72,0,1)"
                  : "opacity 0.3s",
            opacity: visible ? Math.max(0, 1 - swipeDy / 220) : 0,
            willChange: "transform, opacity",
          }}
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
