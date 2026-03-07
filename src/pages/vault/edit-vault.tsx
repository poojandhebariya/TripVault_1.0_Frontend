import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFloppyDisk,
  faPaperPlane,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "react-snackify";

import { ImageCropModal } from "../../utils/image-upload";
import { mediaMutation } from "../../tanstack/media/mutation";
import { vaultMutation } from "../../tanstack/vault/mutation";
import { vaultQueries } from "../../tanstack/vault/queries";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import RichTextEditor from "../../components/ui/rich-text-editor";

import {
  MAX_ATTACHMENTS,
  type AttachmentItem,
  type Visibility,
  type Audience,
} from "../types/attachment-item";
import TagInput from "../../components/ui/tag-input";
import MoodPicker from "../../components/mood-picker";
import LocationSearch, {
  type LocationResult,
} from "../../components/location-search";
import AttachmentsSection from "../../components/attachments-section";
import VisibilitySection from "../../components/visibility-section";
import ScheduleModal from "../../components/schedule-modal";
import type { Vault, VaultAttachment } from "../types/vault";
import { VAULT_IMAGE_CONFIG } from "../../utils/image-upload/image-upload.utils";
import MobileStickyHeader from "../../components/mobile-sticky-header";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-semibold text-gray-700 mb-2">{children}</p>
);

const Divider = () => <div className="h-px bg-gray-100 my-1" />;

const EditVault = () => {
  const { id } = useParams<{ id: string }>();
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

  // For dirty check: since we use refs for performance, we also track values for comparison
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDesc, setCurrentDesc] = useState("");

  const isAttachmentBusy = attachments.some(
    (a) => a.isProcessing || a.isUploading,
  );

  const { getVaultDetails } = vaultQueries();
  const { data: vault, isLoading: isLoadingVault } = useQuery(
    getVaultDetails(id!),
  );

  const { uploadImageMutation } = mediaMutation();
  const { mutateAsync: uploadImage } = useMutation(uploadImageMutation);

  const { updateVaultMutation } = vaultMutation();
  const { mutateAsync: updateVault, isPending: isUpdatingVault } =
    useMutation(updateVaultMutation);

  // Pre-populate data
  useEffect(() => {
    if (vault) {
      if (titleRef.current) titleRef.current.value = vault.title;
      setCurrentTitle(vault.title);

      if (descRef.current) descRef.current.innerHTML = vault.description ?? "";
      setCurrentDesc(vault.description ?? "");

      setTags(vault.tags || []);
      setMood(vault.mood);
      setLocation(
        vault.location
          ? {
              placeId: 0,
              name: vault.location.label,
              lat: vault.location.lat,
              lon: vault.location.lon,
            }
          : null,
      );
      setVisibility((vault.visibility as Visibility) || "public");
      setAudience((vault.audience as Audience) || "everyone");
      setAllowComments(vault.allowComments ?? true);
      setFriendUsername(vault.friendUsername?.join(", ") ?? "");
      setScheduledAt(vault.scheduledAt);

      // Map existing attachments to AttachmentItem
      const existingAtts: AttachmentItem[] = vault.attachments.map(
        (att, idx) => ({
          id: `existing-${idx}`,
          file: new File([], "existing"), // Dummy file object
          previewUrl: att.url,
          type: att.type as "image" | "video",
          uploadedUrl: att.url,
          isUploading: false,
          isProcessing: false,
          cropSrc: att.url,
          isCropOpen: false,
          processedFile: null,
        }),
      );
      setAttachments(existingAtts);
    }
  }, [vault]);

  // DIRTY CHECK LOGIC
  const checkIsDirty = () => {
    if (!vault) return false;

    const titleChanged = currentTitle.trim() !== (vault.title || "").trim();
    const descChanged = currentDesc.trim() !== (vault.description || "").trim();
    const tagsChanged =
      JSON.stringify(tags) !== JSON.stringify(vault.tags || []);
    const moodChanged = mood !== vault.mood;
    const locationChanged =
      JSON.stringify(
        location
          ? { label: location.name, lat: location.lat, lon: location.lon }
          : null,
      ) !== JSON.stringify(vault.location);
    const visibilityChanged = visibility !== vault.visibility;
    const audienceChanged = audience !== vault.audience;
    const commentsChanged = allowComments !== (vault.allowComments ?? true);
    const friendsChanged =
      friendUsername.trim() !== (vault.friendUsername?.join(", ") ?? "").trim();
    const scheduleChanged = scheduledAt !== vault.scheduledAt;

    // Attachments check: simple check if same URLs and same count
    const currentUrls = attachments.map((a) => a.uploadedUrl).filter(Boolean);
    const originalUrls = vault.attachments.map((a) => a.url);
    const attachmentsChanged =
      attachments.length !== vault.attachments.length ||
      JSON.stringify(currentUrls) !== JSON.stringify(originalUrls) ||
      attachments.some((a) => !a.uploadedUrl); // New ones not yet uploaded count as change

    return (
      titleChanged ||
      descChanged ||
      tagsChanged ||
      moodChanged ||
      locationChanged ||
      visibilityChanged ||
      audienceChanged ||
      commentsChanged ||
      friendsChanged ||
      scheduleChanged ||
      attachmentsChanged
    );
  };

  const isDirty = checkIsDirty();

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
        setAttachments((p) => [
          ...p,
          {
            id,
            file,
            previewUrl,
            type: "image",
            uploadedUrl: null,
            isUploading: false,
            isProcessing: true,
            cropSrc: null,
            isCropOpen: false,
            processedFile: null,
          },
        ]);

        (async () => {
          try {
            const {
              compressImageBlob,
              createPreviewUrl,
              readFileAsDataUrl,
              getCroppedImageBlob,
            } = await import("../../utils/image-upload");

            const compressed = await compressImageBlob(
              file,
              `vault-${id}.webp`,
              VAULT_IMAGE_CONFIG.compression,
            );

            const cropSrc = await readFileAsDataUrl(compressed);
            const TARGET_ASPECT = VAULT_IMAGE_CONFIG.crop?.aspect ?? 4 / 3;
            const img = new Image();
            await new Promise<void>((res) => {
              img.onload = () => res();
              img.src = cropSrc;
            });
            const { naturalWidth: w, naturalHeight: h } = img;
            let cropW: number, cropH: number;
            if (w / h > TARGET_ASPECT) {
              cropH = h;
              cropW = Math.round(h * TARGET_ASPECT);
            } else {
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
            console.error("Auto-compression/crop failed", err);
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

  const validateAndSubmit = async (
    mode: "publish" | "draft" | "schedule",
    chosenAt?: string,
  ) => {
    const title = titleRef.current?.value?.trim() ?? "";
    if (!title) {
      showSnackbar({ message: "Please add a title.", variant: "warning" });
      return;
    }

    if (mode !== "draft" && attachments.length === 0) {
      showSnackbar({
        message: "Please add at least one photo or video.",
        variant: "warning",
      });
      return;
    }

    if (mode === "schedule" && !chosenAt && !scheduledAt) {
      setScheduleOpen(true);
      return;
    }

    const resolvedScheduledAt = chosenAt ?? scheduledAt;

    if (attachments.some((a) => a.isProcessing || a.isUploading)) {
      showSnackbar({
        message: "Please wait for processing/uploading.",
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

    const uploadedAttachments: VaultAttachment[] = finalAttachments
      .map((a) => ({
        url: a.uploadedUrl ?? "",
        type: a.type,
      }))
      .filter((a) => a.url); // Safety: filter out any empty URLs

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
      await updateVault({ id: id!, payload });
      showSnackbar({
        message: "Vault updated successfully! 🎉",
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

  if (isLoadingVault) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-4xl text-blue-500"
          />
          <p className="text-gray-500 font-medium">Loading vault details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(dt) => {
          setScheduleOpen(false);
          const iso = dt.length === 16 ? `${dt}:00` : dt;
          setScheduledAt(iso);
          validateAndSubmit("schedule", iso);
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="min-h-screen bg-white">
        <MobileStickyHeader
          title="Edit Vault"
          rightAction={
            <Button
              text={
                isAttachmentBusy
                  ? "Processing…"
                  : isUpdatingVault
                    ? "Saving…"
                    : "Save"
              }
              disabled={isUpdatingVault || isAttachmentBusy || !isDirty}
              onClick={() =>
                validateAndSubmit((vault?.status as any) || "publish")
              }
              className="px-4 py-1.5 rounded-full"
            />
          }
        />

        <div className="max-w-2xl mx-auto px-4 pt-5 pb-10 md:pb-16 space-y-6">
          <Input
            ref={titleRef}
            label="Title"
            placeholder="Catchy title…"
            maxLength={100}
            onChange={(e) => setCurrentTitle(e.target.value)}
          />

          <RichTextEditor
            label="Description"
            placeholder="Describe your trip..."
            contentRef={descRef}
            onChange={(html: string) => setCurrentDesc(html)}
          />

          <Divider />

          <div>
            <FieldLabel>Tags</FieldLabel>
            <TagInput
              tags={tags}
              onAdd={(t) => setTags((p) => [...p, t])}
              onRemove={(t) => setTags((p) => p.filter((x) => x !== t))}
            />
          </div>

          <Divider />

          <div>
            <FieldLabel>Trip Mood</FieldLabel>
            <MoodPicker value={mood} onChange={setMood} />
          </div>

          <Divider />

          <div>
            <FieldLabel>Location</FieldLabel>
            <LocationSearch
              selected={location}
              onSelect={setLocation}
              onClear={() => setLocation(null)}
            />
          </div>

          <Divider />

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

          <div>
            <FieldLabel>Visibility</FieldLabel>
            <VisibilitySection
              visibility={visibility}
              onVisibilityChange={(v) => {
                setVisibility(v);
                // If switching to public, reset audience to a valid public option
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

          {scheduledAt && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-700 font-medium">
              <FontAwesomeIcon icon={faClock} className="shrink-0" />
              <span className="flex-1 truncate">
                Scheduled · {new Date(scheduledAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setScheduledAt(null)}
                className="shrink-0 text-amber-400 hover:text-amber-600 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          )}

          <div className="hidden md:flex gap-3 pt-2">
            <button
              type="button"
              disabled={isUpdatingVault}
              onClick={() => validateAndSubmit("draft")}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faFloppyDisk} className="text-gray-400" />{" "}
              Save Draft
            </button>
            <button
              type="button"
              disabled={isUpdatingVault || isAttachmentBusy}
              onClick={() => setScheduleOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-md text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faClock} className="text-amber-400" />{" "}
              Schedule
            </button>
            <Button
              text={isUpdatingVault ? "Saving…" : "Save Changes"}
              icon={faPaperPlane}
              className="flex-1 py-3"
              onClick={() => validateAndSubmit("publish")}
              disabled={isUpdatingVault || isAttachmentBusy || !isDirty}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditVault;
