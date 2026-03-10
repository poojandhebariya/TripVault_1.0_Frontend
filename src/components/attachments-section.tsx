import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faVideo,
  faCloudArrowUp,
  faCheckCircle,
  faSpinner,
  faXmark,
  faPlus,
  faCrop,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../lib/cn-merge";
import { MAX_ATTACHMENTS, type AttachmentItem } from "../types/attachment-item";

interface AttachmentsSectionProps {
  attachments: AttachmentItem[];
  onAddImage: () => void;
  onAddVideo: () => void;
  /** Upload ALL pending attachments at once */
  onUploadAll: () => void;
  onRemove: (id: string) => void;
  /** Open crop modal for the given attachment id */
  onCrop: (id: string) => void;
  isUploadingAll?: boolean;
}

const AttachmentsSection = ({
  attachments,
  onAddImage,
  onAddVideo,
  onUploadAll,
  onRemove,
  onCrop,
  isUploadingAll = false,
}: AttachmentsSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = Math.min(activeIndex, Math.max(attachments.length - 1, 0));
  const primary = attachments[safeIndex] ?? null;

  // Whether there's at least one attachment that hasn't been uploaded yet
  const hasPending = attachments.some(
    (a) => !a.uploadedUrl && !a.isUploading && !a.isProcessing,
  );

  const allUploaded =
    attachments.length > 0 && attachments.every((a) => !!a.uploadedUrl);

  return (
    <div className="space-y-3">
      {/* ── Large preview ── */}
      <div
        className={cn(
          "relative w-full rounded-md overflow-hidden bg-gray-100 border border-gray-200 aspect-video flex items-center justify-center",
        )}
      >
        {primary ? (
          <>
            {primary.type === "image" ? (
              <img
                src={primary.previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={`${primary.previewUrl}#t=0.001`}
                className="w-full h-full object-cover"
                muted
                playsInline
                controls
                preload="metadata"
              />
            )}

            {/* Processing / uploading overlay */}
            {(primary.isUploading || primary.isProcessing) && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                <FontAwesomeIcon
                  icon={primary.isUploading ? faCloudArrowUp : faSpinner}
                  spin={primary.isProcessing}
                  className="text-2xl"
                />
                <span className="text-xs font-medium">
                  {primary.isUploading ? "Uploading…" : "Processing…"}
                </span>
              </div>
            )}

            {/* Uploaded badge */}
            {primary.uploadedUrl && !primary.isUploading && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                Uploaded
              </div>
            )}

            {/* Type badge */}
            <div className="absolute top-2.5 left-2.5 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              {primary.type === "image" ? "🖼 Photo" : "🎬 Video"}
            </div>

            {/* Crop button — only for images that haven't been uploaded yet */}
            {primary.type === "image" &&
              !primary.uploadedUrl &&
              !primary.isUploading &&
              !primary.isProcessing && (
                <button
                  type="button"
                  onClick={() => onCrop(primary.id)}
                  className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/75 text-white text-xs font-medium rounded-full transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCrop} />
                  Crop
                </button>
              )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FontAwesomeIcon
              icon={faImage}
              className="text-4xl text-gray-300"
            />
            <span className="text-sm text-gray-400">No attachment yet</span>
          </div>
        )}
      </div>

      {/* ── Horizontal thumbnail strip ── */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: MAX_ATTACHMENTS }).map((_, i) => {
          const att = attachments[i];

          if (att) {
            const isActive = i === safeIndex && attachments.length > 0;
            return (
              <button
                key={att.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden border-2 bg-gray-100 focus:outline-none",
                  isActive ? "border-blue-500" : "border-gray-200",
                )}
              >
                {att.type === "image" ? (
                  <img
                    src={att.previewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={`${att.previewUrl}#t=0.001`}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}

                {/* Spinner overlay */}
                {(att.isUploading || att.isProcessing) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="text-white text-sm"
                    />
                  </div>
                )}

                {/* Uploaded dot */}
                {att.uploadedUrl && !att.isUploading && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-white text-[8px]"
                    />
                  </div>
                )}

                {/* Remove button — always visible */}
                {!att.isProcessing && !att.isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActive && safeIndex > 0)
                        setActiveIndex(safeIndex - 1);
                      onRemove(att.id);
                    }}
                    className="absolute top-1 left-1 w-5 h-5 bg-red-500/90 rounded-full flex items-center justify-center text-white text-[8px] cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </button>
            );
          }

          // Empty slot
          return (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={
                attachments.length < MAX_ATTACHMENTS ? onAddImage : undefined
              }
              disabled={attachments.length >= MAX_ATTACHMENTS}
              className="aspect-square rounded-md border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer disabled:cursor-default disabled:hover:border-gray-200 disabled:hover:bg-gray-50"
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="text-gray-300 text-sm"
              />
            </button>
          );
        })}
      </div>

      {/* ── Add buttons ── */}
      {attachments.length < MAX_ATTACHMENTS && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddImage}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faImage} className="text-blue-400" />
            Add Photo
          </button>
          <button
            type="button"
            onClick={onAddVideo}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faVideo} className="text-purple-400" />
            Add Video
          </button>
        </div>
      )}

      {/* ── Single "Upload All" button ── */}
      {attachments.length > 0 && !allUploaded && (
        <button
          type="button"
          onClick={onUploadAll}
          disabled={isUploadingAll || !hasPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer",
            isUploadingAll || !hasPending
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white",
          )}
        >
          <FontAwesomeIcon
            icon={isUploadingAll ? faSpinner : faCloudArrowUp}
            spin={isUploadingAll}
          />
          {isUploadingAll ? "Uploading…" : "Upload All Attachments"}
        </button>
      )}

      {attachments.length >= MAX_ATTACHMENTS && (
        <p className="text-xs text-center text-gray-400">
          Maximum 4 attachments reached
        </p>
      )}
    </div>
  );
};

export default AttachmentsSection;
