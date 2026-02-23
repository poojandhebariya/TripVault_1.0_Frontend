import { useState, useCallback, useRef } from "react";
import {
  readFileAsDataUrl,
  getCroppedImageBlob,
  compressImageBlob,
  createPreviewUrl,
  revokePreviewUrl,
  type PixelCrop,
  type ImageUploadConfig,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_CROP_CONFIG,
} from "./image-upload.utils";

export interface UseImageUploadReturn {
  /** Stable object URL for <img> preview */
  previewUrl: string | null;
  /** The final processed File ready to upload */
  processedFile: File | null;
  /** Whether the crop modal is open */
  isCropOpen: boolean;
  /** Raw data-url fed to the cropper */
  cropSrc: string | null;
  /** Call this when the native <input type="file"> changes */
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Call this from the crop modal when the user confirms crop+compress */
  onCropConfirm: (pixelCrop: PixelCrop) => Promise<void>;
  /** Call this when the user cancels the crop modal */
  onCropCancel: () => void;
  /** Reset everything to empty state */
  reset: () => void;
  /** Pass to <input type="file"> ref so the hook can reset it */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** True while compressing after crop */
  isProcessing: boolean;
}

/**
 * Central hook for image selection → crop → compress → File output.
 *
 * @example
 * const upload = useImageUpload({ crop: { aspect: 1, shape: "round" } });
 * // bind upload.inputRef to <input type="file">
 * // bind upload.onFileSelected to <input onChange>
 * // render <ImageCropModal> controlled by upload.isCropOpen / upload.cropSrc
 */
export function useImageUpload(
  config: ImageUploadConfig = {},
): UseImageUploadReturn {
  const cropConfig = { ...DEFAULT_CROP_CONFIG, ...config.crop };
  const compressionConfig = {
    ...DEFAULT_COMPRESSION_CONFIG,
    ...config.compression,
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState("image");
  const [isProcessing, setIsProcessing] = useState(false);

  // Silence unused variable warning — shape/minZoom/maxZoom are forwarded to modal
  void cropConfig;

  const onFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setPendingFileName(file.name.replace(/\.[^.]+$/, "") || "image");
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setCropSrc(dataUrl);
        setIsCropOpen(true);
      } catch (err) {
        console.error("[useImageUpload] Failed to read file:", err);
      }

      // Reset input value so selecting the same file again triggers onChange
      if (inputRef.current) inputRef.current.value = "";
    },
    [],
  );

  const onCropConfirm = useCallback(
    async (pixelCrop: PixelCrop) => {
      if (!cropSrc) return;
      setIsCropOpen(false);
      setIsProcessing(true);

      try {
        const croppedBlob = await getCroppedImageBlob(
          cropSrc,
          pixelCrop,
          compressionConfig.fileType,
        );
        const compressedFile = await compressImageBlob(
          croppedBlob,
          `${pendingFileName}.webp`,
          compressionConfig,
        );

        // Revoke the previous preview URL to avoid memory leaks
        if (previewUrl) revokePreviewUrl(previewUrl);

        const newPreview = createPreviewUrl(compressedFile);
        setPreviewUrl(newPreview);
        setProcessedFile(compressedFile);
      } catch (err) {
        console.error("[useImageUpload] Crop/compress failed:", err);
      } finally {
        setIsProcessing(false);
        setCropSrc(null);
      }
    },
    [cropSrc, compressionConfig, pendingFileName, previewUrl],
  );

  const onCropCancel = useCallback(() => {
    setIsCropOpen(false);
    setCropSrc(null);
  }, []);

  const reset = useCallback(() => {
    if (previewUrl) revokePreviewUrl(previewUrl);
    setPreviewUrl(null);
    setProcessedFile(null);
    setIsCropOpen(false);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl]);

  return {
    previewUrl,
    processedFile,
    isCropOpen,
    cropSrc,
    onFileSelected,
    onCropConfirm,
    onCropCancel,
    reset,
    inputRef,
    isProcessing,
  };
}
