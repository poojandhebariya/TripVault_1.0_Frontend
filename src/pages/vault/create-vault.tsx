import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFloppyDisk,
  faPaperPlane,
  faXmark,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "react-snackify";

import { cn } from "../../lib/cn-merge";
import { ImageCropModal } from "../../utils/image-upload";
import { mediaMutation } from "../../tanstack/media/mutation";
import { vaultMutation } from "../../tanstack/vault/mutation";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import RichTextEditor from "../../components/ui/rich-text-editor";

import {
  MAX_ATTACHMENTS,
  type AttachmentItem,
  type Visibility,
  type Audience,
} from "../../types/attachment-item";
import TagInput from "../../components/ui/tag-input";
import MoodPicker from "../../components/mood-picker";
import LocationSearch, {
  type LocationResult,
} from "../../components/location-search";
import AttachmentsSection from "../../components/attachments-section";
import VisibilitySection from "../../components/visibility-section";
import ScheduleModal from "../../components/schedule-modal";
import type { Vault, VaultAttachment } from "../../types/vault";
import { VAULT_IMAGE_CONFIG } from "../../utils/image-upload/image-upload.utils";
import MobileStickyHeader from "../../components/mobile-sticky-header";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-semibold text-gray-700 mb-2">{children}</p>
);

const Divider = () => <div className="h-px bg-gray-100 my-1" />;

const CreateVault = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [allowComments, setAllowComments] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [activeCropId, setActiveCropId] = useState<string | null>(null);
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const isAttachmentBusy = attachments.some(
    (a) => a.isProcessing || a.isUploading,
  );

  const { uploadImageMutation } = mediaMutation();
  const { mutateAsync: uploadImage } = useMutation(uploadImageMutation);

  const { createVaultMutation } = vaultMutation();
  const { mutateAsync: createVault, isPending: isCreatingVault } =
    useMutation(createVaultMutation);

  const openFilePicker = (accept: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      showSnackbar({
        message: "Maximum 4 attachments allowed.",
        variant: "warning",
      });
      return;
    }

    for (const file of files.slice(0, remaining)) {
      const isVideo = file.type.startsWith("video/");
      const previewUrl = URL.createObjectURL(file);
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      if (isVideo) {
        setAttachments((p) => [
          ...p,
          {
            id,
            file,
            previewUrl,
            type: "video",
            uploadedUrl: null,
            isUploading: false,
            isProcessing: false,
            cropSrc: null,
            isCropOpen: false,
            processedFile: file,
          },
        ]);
      } else {
        // Add the item immediately with isProcessing=true so UI shows a spinner
        setAttachments((p) => [
          ...p,
          {
            id,
            file,
            previewUrl,
            type: "image",
            uploadedUrl: null,
            isUploading: false,
            isProcessing: true, // ← compressing in background
            cropSrc: null,
            isCropOpen: false,
            processedFile: null,
          },
        ]);

        // Auto-compress + auto-center-crop to 4:3 in background
        (async () => {
          try {
            const {
              compressImageBlob,
              createPreviewUrl,
              readFileAsDataUrl,
              getCroppedImageBlob,
            } = await import("../../utils/image-upload");

            // 1. Compress first
            const compressed = await compressImageBlob(
              file,
              `vault-${id}.webp`,
              VAULT_IMAGE_CONFIG.compression,
            );

            // 2. Read as data URL so we can draw to canvas
            const cropSrc = await readFileAsDataUrl(compressed);

            // 3. Auto-apply a center 4:3 crop so the image already has the
            //    correct ratio even if the user never opens the crop modal.
            const TARGET_ASPECT = VAULT_IMAGE_CONFIG.crop?.aspect ?? 4 / 3;
            const img = new Image();
            await new Promise<void>((res) => {
              img.onload = () => res();
              img.src = cropSrc;
            });
            const { naturalWidth: w, naturalHeight: h } = img;
            let cropW: number, cropH: number;
            if (w / h > TARGET_ASPECT) {
              // image is wider than target → crop width
              cropH = h;
              cropW = Math.round(h * TARGET_ASPECT);
            } else {
              // image is taller than target → crop height
              cropW = w;
              cropH = Math.round(w / TARGET_ASPECT);
            }
            const cropX = Math.round((w - cropW) / 2);
            const cropY = Math.round((h - cropH) / 2);

            const croppedBlob = await getCroppedImageBlob(
              cropSrc,
              { x: cropX, y: cropY, width: cropW, height: cropH },
              "image/webp",
            );
            const finalFile = await compressImageBlob(
              croppedBlob,
              `vault-${id}.webp`,
              VAULT_IMAGE_CONFIG.compression,
            );
            const finalPreview = createPreviewUrl(finalFile);
            // Re-read cropSrc from finalFile so the crop modal also shows the correct image
            const finalCropSrc = await readFileAsDataUrl(finalFile);

            setAttachments((p) =>
              p.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      previewUrl: finalPreview,
                      processedFile: finalFile,
                      cropSrc: finalCropSrc,
                      isProcessing: false,
                    }
                  : a,
              ),
            );
          } catch (err) {
            console.error(
              "Auto-compression/crop failed, falling back to original",
              err,
            );
            // Fallback: use original file uncompressed
            const cropSrc = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve(ev.target?.result as string);
              reader.readAsDataURL(file);
            });
            setAttachments((p) =>
              p.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      processedFile: file,
                      cropSrc,
                      isProcessing: false,
                    }
                  : a,
              ),
            );
          }
        })();
      }
    }
    if (e.target) e.target.value = "";
  };

  // ── crop ─────────────────────────────────────────────────────────────────

  /** Called from preview "Crop" button */
  const openCrop = (id: string) => {
    setAttachments((p) =>
      p.map((a) => (a.id === id ? { ...a, isCropOpen: true } : a)),
    );
    setActiveCropId(id);
  };

  const handleCropConfirm = async (pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (!activeCropId) return;
    const att = attachments.find((a) => a.id === activeCropId);
    if (!att?.cropSrc) return;

    setAttachments((p) =>
      p.map((a) =>
        a.id === activeCropId
          ? { ...a, isCropOpen: false, isProcessing: true }
          : a,
      ),
    );
    setActiveCropId(null);

    try {
      const {
        getCroppedImageBlob,
        compressImageBlob,
        createPreviewUrl,
        readFileAsDataUrl,
      } = await import("../../utils/image-upload");
      const blob = await getCroppedImageBlob(
        att.cropSrc,
        pixelCrop,
        "image/webp",
      );
      const compressed = await compressImageBlob(blob, `vault-${att.id}.webp`);
      const preview = createPreviewUrl(compressed);
      const newCropSrc = await readFileAsDataUrl(compressed);
      setAttachments((p) =>
        p.map((a) =>
          a.id === att.id
            ? {
                ...a,
                previewUrl: preview,
                processedFile: compressed,
                cropSrc: newCropSrc,
                isProcessing: false,
              }
            : a,
        ),
      );
    } catch (err) {
      console.error(err);
      setAttachments((p) =>
        p.map((a) => (a.id === att.id ? { ...a, isProcessing: false } : a)),
      );
    }
  };

  const handleCropCancel = () => {
    if (activeCropId) {
      setAttachments((p) =>
        p.map((a) => (a.id === activeCropId ? { ...a, isCropOpen: false } : a)),
      );
      setActiveCropId(null);
    }
  };

  // ── upload all ───────────────────────────────────────────────────────────

  /** Upload every pending (not yet uploaded) attachment sequentially. */
  const uploadAllAttachments = async (): Promise<AttachmentItem[] | null> => {
    const pending = attachments.filter(
      (a) => !a.uploadedUrl && !a.isUploading && !a.isProcessing,
    );
    if (!pending.length) return attachments;

    setIsUploadingAll(true);
    let currentAtts = [...attachments];

    for (const att of pending) {
      const idx = currentAtts.findIndex((a) => a.id === att.id);
      if (idx === -1) continue;

      setAttachments((p) =>
        p.map((a) => (a.id === att.id ? { ...a, isUploading: true } : a)),
      );
      try {
        const url = await uploadImage({
          file: att.processedFile ?? att.file,
          context: "vault-attachment",
        });

        currentAtts[idx] = {
          ...currentAtts[idx],
          uploadedUrl: url,
          isUploading: false,
        };
        setAttachments([...currentAtts]);
      } catch {
        setIsUploadingAll(false);
        showSnackbar({
          message: `Failed to upload "${att.file.name}". Please try again.`,
          variant: "error",
        });
        return null;
      }
    }

    setIsUploadingAll(false);
    return currentAtts;
  };

  const removeAttachment = (id: string) =>
    setAttachments((p) => p.filter((a) => a.id !== id));

  // ── submit ───────────────────────────────────────────────────────────────

  /**
   * @param mode      - "publish" | "draft" | "schedule"
   * @param chosenAt  - ISO datetime string chosen from the schedule modal.
   *                    When provided, skips the modal-open gate and uses
   *                    this value directly as scheduledAt.
   */
  const validateAndSubmit = async (
    mode: "publish" | "draft" | "schedule",
    chosenAt?: string,
  ) => {
    const title = titleRef.current?.value?.trim() ?? "";
    if (!title) {
      showSnackbar({
        message: "Please add a title for your vault.",
        variant: "warning",
      });
      return;
    }

    if (mode !== "draft") {
      if (tags.length < 3) {
        showSnackbar({
          message: "Please add at least 3 tags before publishing.",
          variant: "warning",
        });
        return;
      }
      if (!mood) {
        showSnackbar({
          message: "Please select a trip mood before publishing.",
          variant: "warning",
        });
        return;
      }
      if (!location) {
        showSnackbar({
          message: "Please add a location before publishing.",
          variant: "warning",
        });
        return;
      }
      if (attachments.length === 0) {
        showSnackbar({
          message: "Please add at least one photo or video before publishing.",
          variant: "warning",
        });
        return;
      }
    }

    // If scheduling and no datetime provided yet, open the modal so the
    // user can pick one (the modal's onConfirm will re-call this function
    // with the chosen datetime).
    if (mode === "schedule" && !chosenAt && !scheduledAt) {
      setScheduleOpen(true);
      return;
    }

    // Resolve the final scheduledAt: prefer the freshly-chosen value,
    // then fall back to the previously stored state.
    const resolvedScheduledAt = chosenAt ?? scheduledAt;

    // Block if any attachment is still being processed (compressed)
    const stillProcessing = attachments.some((a) => a.isProcessing);
    if (stillProcessing) {
      showSnackbar({
        message: "Please wait until all images finish processing.",
        variant: "warning",
      });
      return;
    }

    // Block if any attachment is currently uploading
    const stillUploading = attachments.some((a) => a.isUploading);
    if (stillUploading) {
      showSnackbar({
        message: "Please wait until all attachments finish uploading.",
        variant: "warning",
      });
      return;
    }

    // Auto-upload any pending (selected but not yet uploaded) attachments
    let finalAttachments = attachments;
    const hasPending = attachments.some(
      (a) => !a.uploadedUrl && !a.isUploading,
    );
    if (hasPending) {
      const result = await uploadAllAttachments();
      if (!result) return;
      finalAttachments = result;
    }

    // Re-read state to get latest uploadedUrls after the upload
    const uploadedAttachments: VaultAttachment[] = finalAttachments
      .map((a) => ({
        url: a.uploadedUrl ?? "",
        type: a.type,
      }))
      .filter((a) => a.url);

    const description = descRef.current?.innerHTML?.trim() ?? "";

    const payload: Vault = {
      title,
      description,
      tags,
      mood,
      location: location
        ? { label: location.name, lat: location.lat, lon: location.lon }
        : null,
      visibility,
      audience,
      allowComments,
      // Friends tagging is independent of visibility — always send if set
      friendUsername: friendUsername.trim()
        ? friendUsername
            .split(",")
            .map((u) => u.trim().replace(/^@/, ""))
            .filter(Boolean)
        : undefined,
      attachments: uploadedAttachments,
      scheduledAt: mode === "schedule" ? resolvedScheduledAt : null,
      status: mode,
    };

    try {
      await createVault(payload);
      // Also persist into state so the UI indicator updates
      if (mode === "schedule" && resolvedScheduledAt) {
        setScheduledAt(resolvedScheduledAt);
      }
      showSnackbar({
        message:
          mode === "draft"
            ? "Vault saved as draft!"
            : mode === "schedule"
              ? `Scheduled for ${new Date(resolvedScheduledAt!).toLocaleString()}`
              : "Vault published! 🎉",
        variant: "success",
      });
      navigate(-1);
    } catch {
      showSnackbar({
        message: "Something went wrong. Please try again.",
        variant: "error",
      });
    }
  };

  const activeCropAtt = attachments.find((a) => a.id === activeCropId);

  return (
    <>
      {/* Crop modal */}
      {activeCropAtt && (
        <ImageCropModal
          open={activeCropAtt.isCropOpen}
          imageSrc={activeCropAtt.cropSrc}
          config={VAULT_IMAGE_CONFIG.crop}
          title="Crop Photo"
          description="Drag & zoom · Rotate if needed"
          isProcessing={activeCropAtt.isProcessing}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Schedule modal */}
      <ScheduleModal
        open={scheduleOpen}
        initialDate={scheduledAt}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(dt) => {
          setScheduleOpen(false);
          // Normalise "YYYY-MM-DDTHH:mm" → "YYYY-MM-DDTHH:mm:ss" so the
          // Spring ISO_DATE_TIME parser always gets a valid value.
          const iso = dt.length === 16 ? `${dt}:00` : dt;
          setScheduledAt(iso);
          // Immediately submit — passes the datetime directly so we don't
          // depend on the state update being flushed first.
          validateAndSubmit("schedule", iso);
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Page ── */}
      <div className="min-h-screen bg-white">
        <MobileStickyHeader
          title="Create Vault"
          rightAction={
            <Button
              text={
                isAttachmentBusy
                  ? "Processing…"
                  : isCreatingVault
                    ? "Publishing…"
                    : "Publish"
              }
              disabled={isCreatingVault || isAttachmentBusy}
              onClick={() => validateAndSubmit("publish")}
              className="px-4 py-1.5 rounded-full"
            />
          }
        />

        {/* Form body */}
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-10 md:pb-16 space-y-6">
          {/* Title */}
          <Input
            ref={titleRef}
            label="Title"
            placeholder="Give your trip a catchy title…"
            maxLength={100}
          />

          {/* Description */}
          <RichTextEditor
            label="Description"
            placeholder="Describe your trip experience — what made it special?"
            contentRef={descRef}
          />

          <Divider />

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            <TagInput
              tags={tags}
              onAdd={(t) => setTags((p) => [...p, t])}
              onRemove={(t) => setTags((p) => p.filter((x) => x !== t))}
            />
          </div>

          <Divider />

          {/* Mood */}
          <div>
            <FieldLabel>Trip Mood</FieldLabel>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <Divider />

          {/* Location */}
          <div>
            <FieldLabel>Location</FieldLabel>
            <LocationSearch
              selected={location}
              onSelect={setLocation}
              onClear={() => setLocation(null)}
            />
          </div>

          <Divider />

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Photos &amp; Videos</FieldLabel>
              <span className="text-xs text-gray-400 -mt-2">
                {attachments.length}/{MAX_ATTACHMENTS}
              </span>
            </div>
            <AttachmentsSection
              attachments={attachments}
              onAddImage={() => openFilePicker("image/*")}
              onAddVideo={() => openFilePicker("video/*")}
              onUploadAll={uploadAllAttachments}
              onRemove={removeAttachment}
              onCrop={openCrop}
              isUploadingAll={isUploadingAll}
            />
          </div>

          <Divider />

          {/* Visibility */}
          <div>
            <FieldLabel>Visibility</FieldLabel>
            <VisibilitySection
              visibility={visibility}
              onVisibilityChange={(v) => {
                setVisibility(v);
                if (v === "public") {
                  setAudience("everyone");
                }
              }}
              audience={audience}
              onAudienceChange={setAudience}
              allowComments={allowComments}
              onAllowCommentsChange={setAllowComments}
              friendUsername={friendUsername}
              onFriendUsernameChange={setFriendUsername}
            />
          </div>

          {/* Scheduled indicator */}
          {scheduledAt && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-700 font-medium animate-[popIn_0.2s_ease-out]",
              )}
            >
              <FontAwesomeIcon icon={faClock} className="shrink-0" />
              <span className="flex-1 truncate">
                Scheduled · {new Date(scheduledAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                title="Edit Scheduled Time"
                className="shrink-0 text-amber-500 hover:text-amber-700 cursor-pointer mr-2 transition-colors"
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button
                type="button"
                onClick={() => setScheduledAt(null)}
                title="Remove Schedule"
                className="shrink-0 text-amber-400 hover:text-amber-600 cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          )}

          {/* Desktop bottom actions */}
          <div className="hidden md:flex gap-3 pt-2">
            <button
              type="button"
              disabled={isCreatingVault}
              onClick={() => validateAndSubmit("draft")}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFloppyDisk} className="text-gray-400" />{" "}
              Save Draft
            </button>
            <button
              type="button"
              disabled={isCreatingVault || isAttachmentBusy}
              onClick={() => setScheduleOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faClock} className="text-amber-400" />{" "}
              Schedule
            </button>
            <Button
              text={isCreatingVault ? "Publishing…" : "Publish Trip"}
              icon={faPaperPlane}
              className="flex-1 py-3"
              onClick={() => validateAndSubmit("publish")}
              disabled={isCreatingVault || isAttachmentBusy}
            />
          </div>
        </div>

        {/* Mobile bottom action bar */}
        <div className="md:hidden px-4 py-2 bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
          <div className="flex gap-2 mx-auto">
            <button
              type="button"
              disabled={isCreatingVault}
              onClick={() => validateAndSubmit("draft")}
              className="flex items-center justify-center gap-1.5 w-1/2 px-3 py-2.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFloppyDisk} /> Draft
            </button>
            <button
              type="button"
              disabled={isCreatingVault || isAttachmentBusy}
              onClick={() => setScheduleOpen(true)}
              className="flex items-center justify-center gap-1.5 w-1/2 px-3 py-2.5 border border-gray-200 rounded-md text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faClock} /> Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateVault;
