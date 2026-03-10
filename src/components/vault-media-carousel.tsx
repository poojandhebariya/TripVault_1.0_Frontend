import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faImage,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import ImagePreviewModal from "./ui/image-preview-modal";

interface MediaAttachment {
  type: "image" | "video";
  url: string;
}

interface VaultMediaCarouselProps {
  media: MediaAttachment[];
  title?: string;
  maxHeight?: string;
  aspectRatio?: string;
  className?: string; // Wrapper className
  slideClassName?: string;
  showCounter?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  onMediaClick?: (media: MediaAttachment) => void;
  overlayElement?: React.ReactNode;
}

const VaultMediaCarousel = ({
  media,
  maxHeight = "75vh",
  aspectRatio = "4/3",
  className,
  slideClassName,
  showCounter = true,
  showDots = true,
  showArrows = true,
  overlayElement,
}: VaultMediaCarouselProps) => {
  const [activeImg, setActiveImg] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImg((p) => (p - 1 + media.length) % media.length);
  };
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImg((p) => (p + 1) % media.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy)
      dx > 0
        ? setActiveImg((p) => (p + 1) % media.length)
        : setActiveImg((p) => (p - 1 + media.length) % media.length);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      className={cn(
        "relative w-full select-none bg-gray-900 overflow-hidden",
        className,
      )}
      style={{ aspectRatio, maxHeight }}
    >
      {/* Slide strip */}
      {media.length > 0 ? (
        <div
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeImg * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {media.map((m, i) => (
            <div
              key={i}
              className={cn("w-full h-full shrink-0", slideClassName)}
            >
              {m.type === "video" ? (
                <video
                  src={m.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={m.url || ""}
                  alt={`media ${i + 1}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  draggable={false}
                  onClick={() => setPreviewSrc(m.url)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-linear-to-br from-gray-800 to-gray-900">
          <FontAwesomeIcon icon={faImage} className="text-white/20 text-5xl" />
          <p className="text-white/30 text-sm font-medium">No media added</p>
        </div>
      )}

      {/* Overlay contents (moodMeta, title, etc) */}
      {overlayElement}

      {/* Photo counter – top right */}
      {showCounter && media.length > 1 && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
          <FontAwesomeIcon icon={faCamera} className="text-[10px]" />
          {activeImg + 1} / {media.length}
        </div>
      )}

      {/* Prev / Next arrows (desktop) */}
      {showArrows && media.length > 1 && (
        <>
          <button
            onClick={prevImg}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center text-white hover:bg-white/40 hover:scale-105 transition-all cursor-pointer z-10 shadow-lg"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <button
            onClick={nextImg}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center text-white hover:bg-white/40 hover:scale-105 transition-all cursor-pointer z-10 shadow-lg"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showDots && media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-5 flex gap-1.5 z-10">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={cn(
                "rounded-full transition-all duration-300 cursor-pointer",
                i === activeImg
                  ? "w-4 md:w-5 h-1.5 bg-white drop-shadow-md"
                  : "w-1.5 h-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      )}

      <ImagePreviewModal
        src={previewSrc ?? undefined}
        isOpen={!!previewSrc}
        onClose={() => setPreviewSrc(null)}
      />
    </div>
  );
};

export default VaultMediaCarousel;
