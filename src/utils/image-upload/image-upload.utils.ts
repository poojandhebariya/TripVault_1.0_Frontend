import imageCompression from "browser-image-compression";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompressionConfig {
  /** Max output file size in MB. Default: 0.5 */
  maxSizeMB?: number;
  /** Max dimension (width or height) in px. Default: 1600 */
  maxWidthOrHeight?: number;
  /** MIME type of the output. Default: "image/webp" */
  fileType?: string;
  /** Quality 0–1. Default: 0.82 */
  initialQuality?: number;
}

export interface CropConfig {
  /** Aspect ratio (width / height). Undefined = free aspect */
  aspect?: number;
  /** Shape of the crop overlay. Default: "rect" */
  shape?: "rect" | "round";
  /** Minimum zoom level. Default: 1 */
  minZoom?: number;
  /** Maximum zoom level. Default: 3 */
  maxZoom?: number;
}

export interface ImageUploadConfig {
  compression?: CompressionConfig;
  crop?: CropConfig;
}

export const DEFAULT_COMPRESSION_CONFIG: Required<CompressionConfig> = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  fileType: "image/webp",
  initialQuality: 0.82,
};

export const DEFAULT_CROP_CONFIG: Required<CropConfig> = {
  aspect: undefined as unknown as number, // free
  shape: "rect",
  minZoom: 1,
  maxZoom: 3,
};

export const PROFILE_PIC_CONFIG: ImageUploadConfig = {
  compression: {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 400,
    fileType: "image/webp",
    initialQuality: 0.85,
  },
  crop: { aspect: 1, shape: "round", minZoom: 1, maxZoom: 4 },
};

export const COVER_PHOTO_CONFIG: ImageUploadConfig = {
  compression: {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    fileType: "image/webp",
    initialQuality: 0.82,
  },
  crop: { aspect: 16 / 4, shape: "rect", minZoom: 1, maxZoom: 3 },
};

/**
 * Creates a cropped image blob from a source image URL and a pixel crop region.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputType: string = "image/webp",
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob returned null"));
    }, outputType);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Compresses a Blob using browser-image-compression and returns the result as a File.
 */
export async function compressImageBlob(
  blob: Blob,
  filename: string = "image.webp",
  config: CompressionConfig = {},
): Promise<File> {
  const mergedConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...config };

  // browser-image-compression requires a File
  const file = new File([blob], filename, { type: blob.type });

  const compressed = await imageCompression(file, {
    maxSizeMB: mergedConfig.maxSizeMB,
    maxWidthOrHeight: mergedConfig.maxWidthOrHeight,
    fileType: mergedConfig.fileType,
    initialQuality: mergedConfig.initialQuality,
    useWebWorker: true,
  });

  return new File([compressed], filename, { type: mergedConfig.fileType });
}

/** Convert a File/Blob to a local object URL for preview */
export function createPreviewUrl(file: Blob): string {
  return URL.createObjectURL(file);
}

/** Clean up a previously created object URL */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/** Read a file as a data URL (for the cropper source) */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
