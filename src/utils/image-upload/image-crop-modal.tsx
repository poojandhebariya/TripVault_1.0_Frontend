import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCropSimple,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faRotateRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import type { PixelCrop, CropConfig } from "./image-upload.utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImageCropModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Data-URL of the source image to crop */
  imageSrc: string | null;
  /** Crop configuration (aspect, shape, zoom limits) */
  config?: CropConfig;
  /** Label shown in the modal header, e.g. "Profile Picture" */
  title?: string;
  /** Description text shown below the title */
  description?: string;
  /** True while compression is running after the user confirms */
  isProcessing?: boolean;
  /** Called with the pixel crop region when the user confirms */
  onConfirm: (pixelCrop: PixelCrop) => void;
  /** Called when the user cancels */
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ImageCropModal = ({
  open,
  imageSrc,
  config = {},
  title = "Crop Image",
  description = "Drag to reposition · Scroll or pinch to zoom",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ImageCropModalProps) => {
  const { aspect, shape = "rect", minZoom = 1, maxZoom = 3 } = config;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(minZoom);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  // Reset state every time a new image is loaded
  useEffect(() => {
    if (imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(minZoom);
      setRotation(0);
      setCroppedAreaPixels(null);
    }
  }, [imageSrc, minZoom]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPx: Area) => {
      setCroppedAreaPixels(croppedAreaPx);
    },
    [],
  );

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;
    onConfirm({
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    });
  };

  if (!open || !imageSrc) return null;

  const aspectLabel =
    aspect === 1
      ? "1 : 1"
      : aspect === 16 / 9
        ? "16 : 9"
        : aspect === 16 / 5
          ? "16 : 5"
          : aspect
            ? `${aspect.toFixed(2)} : 1`
            : "Free";

  return createPortal(
    <div
      className={`
        fixed inset-0 z-9999 flex items-center justify-center p-4
        transition-all duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Modal card */}
      <div
        className={`
          relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden
          flex flex-col
          transition-all duration-300
          ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
        style={{ maxHeight: "90dvh" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-md">
              <FontAwesomeIcon
                icon={faCropSimple}
                className="text-white text-xs"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
            aria-label="Close crop modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* ── Crop area ── */}
        <div
          className="relative w-full"
          style={{ height: "340px", background: "#0f0f0f" }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={shape}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: "2px solid rgba(99,102,241,0.9)",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              },
            }}
          />

          {/* Aspect badge */}
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
            {aspectLabel}
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="px-5 py-4 space-y-4 bg-gray-50 border-t border-gray-100">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((z) => Math.max(minZoom, z - 0.1))}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 text-xs"
              aria-label="Zoom out"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
            </button>
            <div className="flex-1 relative">
              <input
                type="range"
                min={minZoom}
                max={maxZoom}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4f46e5 ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%, #e5e7eb ${((zoom - minZoom) / (maxZoom - minZoom)) * 100}%)`,
                }}
                aria-label="Zoom"
              />
            </div>
            <button
              onClick={() => setZoom((z) => Math.min(maxZoom, z + 0.1))}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 text-xs"
              aria-label="Zoom in"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
            </button>
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
              {zoom.toFixed(1)}×
            </span>
          </div>

          {/* Rotation slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRotation(0)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 text-xs"
              aria-label="Reset rotation"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <div className="flex-1 relative">
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #4f46e5 50%, #e5e7eb 100%)`,
                }}
                aria-label="Rotation"
              />
            </div>
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
              {rotation}°
            </span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!croppedAreaPixels || isProcessing}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            {isProcessing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Processing…
              </>
            ) : (
              "Apply Crop"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ImageCropModal;
