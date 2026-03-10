export const MAX_ATTACHMENTS = 4;

export type Visibility = "public" | "private";
export type Audience = "everyone" | "followers";

export interface AttachmentItem {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  uploadedUrl: string | null;
  isUploading: boolean;
  isProcessing: boolean;
  cropSrc: string | null;
  isCropOpen: boolean;
  processedFile: File | null;
}
