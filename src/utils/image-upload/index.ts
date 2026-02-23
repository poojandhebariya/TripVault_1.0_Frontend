/**
 * Central image-upload barrel.
 *
 * Usage:
 *   import { useImageUpload, ImageCropModal, PROFILE_PIC_CONFIG, COVER_PHOTO_CONFIG } from "@/utils/image-upload";
 */

export { useImageUpload } from "./use-image-upload";
export type { UseImageUploadReturn } from "./use-image-upload";

export { default as ImageCropModal } from "./image-crop-modal";

export {
  getCroppedImageBlob,
  compressImageBlob,
  createPreviewUrl,
  revokePreviewUrl,
  readFileAsDataUrl,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_CROP_CONFIG,
  PROFILE_PIC_CONFIG,
  COVER_PHOTO_CONFIG,
} from "./image-upload.utils";

export type {
  PixelCrop,
  CompressionConfig,
  CropConfig,
  ImageUploadConfig,
} from "./image-upload.utils";
