import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type TouchEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faImage,
  faPen,
  faTrash,
  faThumbTack,
  faChartSimple,
  faArrowUpRightFromSquare,
  faShare,
  faClock,
  faSpinner,
  faPaperPlane,
  faXmark,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { Vault } from "../../../types/vault";
import { useMutation } from "@tanstack/react-query";
import { vaultMutation } from "../../../tanstack/vault/mutation";
import { useSnackbar } from "react-snackify";
import type { AxiosError } from "axios";
import VaultInsightsModal from "../../../components/ui/vault-insights-modal";
import DeleteConfirmModal from "../../../components/ui/delete-confirm-modal";
import ShareModal from "../../../components/ui/share-modal";
import { getVaultShareUrl, ROUTES } from "../../../utils/constants";

interface ActionBtnProps {
  icon: IconDefinition;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  loading?: boolean;
}

const ActionBtn = ({
  icon,
  label,
  onClick,
  danger = false,
  active = false,
  loading = false,
}: ActionBtnProps) => (
  <button
    title={label}
    onClick={onClick}
    disabled={loading}
    className={`group flex flex-col items-center gap-1 cursor-pointer transition-all duration-150 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed ${
      danger
        ? "text-rose-400 hover:text-rose-300"
        : active
          ? "text-amber-400 hover:text-amber-300"
          : "text-white/80 hover:text-white"
    }`}
  >
    <div
      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-150 ${
        danger
          ? "bg-rose-500/20 border-rose-500/30 group-hover:bg-rose-500/35"
          : active
            ? "bg-amber-400/20 border-amber-400/30 group-hover:bg-amber-400/35"
            : "bg-white/10 border-white/15 group-hover:bg-white/20"
      }`}
    >
      <FontAwesomeIcon
        icon={loading ? faSpinner : icon}
        className={`text-sm ${loading ? "animate-spin" : ""}`}
      />
    </div>
    <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70 leading-none">
      {label}
    </span>
  </button>
);

export interface VaultViewerProps {
  vault: Vault;
  allVaults: Vault[];
  onClose: () => void;
  onNavigate: (v: Vault) => void;
  readOnly?: boolean;
}

const VaultViewer = ({
  vault,
  allVaults,
  onClose,
  onNavigate,
  readOnly = false,
}: VaultViewerProps) => {
  const navigate = useNavigate();
  const [mediaIdx, setMediaIdx] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { showSnackbar } = useSnackbar();

  const { togglePinMutation, deleteVaultMutation, publishVaultMutation } =
    vaultMutation();
  const { mutate: togglePin, isPending: isPinning } =
    useMutation(togglePinMutation);
  const { mutate: deleteVault, isPending: isDeleting } =
    useMutation(deleteVaultMutation);
  const { mutate: publishVault, isPending: isPublishing } = useMutation(
    publishVaultMutation(vault.id!),
  );

  const idx = allVaults.findIndex((v) => v.id === vault.id);
  const hasPrev = idx > 0;
  const hasNext = idx < allVaults.length - 1;
  const attachments = vault.attachments ?? [];
  const current = attachments[mediaIdx];
  const isPinned = !!vault.isPinned;

  useEffect(() => setMediaIdx(0), [vault.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        if (mediaIdx < attachments.length - 1) setMediaIdx((p) => p + 1);
        else if (hasNext) onNavigate(allVaults[idx + 1]);
      }
      if (e.key === "ArrowLeft") {
        if (mediaIdx > 0) setMediaIdx((p) => p - 1);
        else if (hasPrev) onNavigate(allVaults[idx - 1]);
      }
    },
    [
      onClose,
      hasNext,
      hasPrev,
      allVaults,
      idx,
      mediaIdx,
      attachments.length,
      onNavigate,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      if (dx > 0 && mediaIdx < attachments.length - 1)
        setMediaIdx((p) => p + 1);
      else if (dx < 0 && mediaIdx > 0) setMediaIdx((p) => p - 1);
    }
    touchStartX.current = null;
  };

  const handlePin = () => {
    if (!vault.id) return;
    togglePin(vault.id, {
      onSuccess: (updated) => {
        const nowPinned = updated.isPinned;
        showSnackbar({
          message: nowPinned ? "Post pinned to your profile" : "Post unpinned",
          variant: "success",
          classname: "text-white",
        });
        onNavigate({ ...vault, isPinned: nowPinned });
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message: string }>;
        const msg = axiosErr?.response?.data?.message ?? "Failed to pin post";
        showSnackbar({
          message: msg,
          variant: "error",
          classname: "text-white",
        });
      },
    });
  };

  const handlePublish = () => {
    if (!vault.id) return;
    publishVault(undefined as any, {
      onSuccess: () => {
        showSnackbar({
          message: "Vault published! 🎉",
          variant: "success",
          classname: "text-white",
        });
        onNavigate({ ...vault, status: "publish", scheduledAt: null });
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message: string }>;
        const msg =
          axiosErr?.response?.data?.message ?? "Failed to publish vault";
        showSnackbar({
          message: msg,
          variant: "error",
          classname: "text-white",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!vault.id) return;
    deleteVault(vault.id, {
      onSuccess: () => {
        showSnackbar({
          message: "Vault deleted",
          variant: "success",
          classname: "text-white",
        });
        onClose();
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message: string }>;
        const msg =
          axiosErr?.response?.data?.message ?? "Failed to delete vault";
        showSnackbar({
          message: msg,
          variant: "error",
          classname: "text-white",
        });
      },
    });
  };

  const ownerActions: ActionBtnProps[] = [
    {
      icon: faPen,
      label: "Edit",
      onClick: () => navigate(`/vault/edit/${vault.id}`),
    },
    ...(vault.status === "draft"
      ? [
          {
            icon: faPaperPlane,
            label: "Publish",
            onClick: handlePublish,
            loading: isPublishing,
          },
        ]
      : []),
    ...(vault.status === "publish"
      ? [
          {
            icon: faThumbTack,
            label: isPinned ? "Unpin" : "Pin",
            onClick: handlePin,
            active: isPinned,
            loading: isPinning,
          },
          {
            icon: faChartSimple,
            label: "Insights",
            onClick: () => setShowInsights(true),
          },
        ]
      : []),
    {
      icon: faTrash,
      label: "Delete",
      onClick: () => setShowDeleteConfirm(true),
      danger: true,
      loading: isDeleting,
    },
  ];

  const viewActions: ActionBtnProps[] = [
    {
      icon: faArrowUpRightFromSquare,
      label: "Detail",
      onClick: () => navigate(`/vault/${vault.id}`),
    },
    {
      icon: faShare,
      label: "Share",
      onClick: () => setShowShare(true),
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      >
        <div
          className="relative flex flex-col w-full max-w-[420px] md:max-w-[600px] animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full rounded-2xl overflow-hidden select-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {current ? (
              current.type === "video" ? (
                <video
                  key={current.url}
                  src={`${current.url}#t=0.001`}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[65vh] h-auto object-contain bg-transparent block"
                />
              ) : (
                <img
                  key={current.url}
                  src={current.url}
                  alt={vault.title}
                  draggable={false}
                  className="w-full max-h-[65vh] h-auto object-contain bg-transparent block"
                />
              )
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-white/15 text-7xl rounded-2xl bg-white/5">
                <FontAwesomeIcon icon={faImage} />
              </div>
            )}

            {mediaIdx > 0 && (
              <button
                onClick={() => setMediaIdx((p) => p - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/75 hover:scale-110 transition-all cursor-pointer shadow-lg"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
              </button>
            )}

            {mediaIdx < attachments.length - 1 && (
              <button
                onClick={() => setMediaIdx((p) => p + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/75 hover:scale-110 transition-all cursor-pointer shadow-lg"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
              </button>
            )}

            {attachments.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {attachments.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaIdx(i)}
                    className={`rounded-full transition-all duration-200 cursor-pointer ${
                      i === mediaIdx
                        ? "w-4 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {vault.status === "schedule" && vault.scheduledAt && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-20">
              <FontAwesomeIcon icon={faClock} className="text-amber-400" />
              <span>
                Scheduled for{" "}
                {new Date(vault.scheduledAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-4 px-2">
            {!readOnly && (
              <div className="flex items-center gap-2 sm:gap-4">
                {ownerActions.map((a) => (
                  <ActionBtn key={a.label} {...a} />
                ))}
              </div>
            )}
            <div className={`flex items-center gap-2 sm:gap-4 ${readOnly ? "mx-auto" : ""}`}>
              {viewActions.map((a) => (
                <ActionBtn key={a.label} {...a} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <VaultInsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        vault={vault}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        itemName={vault.title}
        itemType="vault"
        isLoading={isDeleting}
      />

      {vault.id && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          url={getVaultShareUrl(vault.id)}
          title={vault.title}
          description={vault.description}
        />
      )}
    </>
  );
};

export default VaultViewer;
