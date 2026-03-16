import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Modal from "./modal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "item",
  isLoading = false,
}: DeleteConfirmModalProps) => {
  return (
    <Modal open={isOpen} onClose={onClose} showCloseButton={false} size="sm">
      <div className="flex flex-col items-center gap-5 pt-2 pb-1 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-rose-50" />
          <div className="absolute w-16 h-16 rounded-full bg-rose-100" />
          <div className="relative w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center shadow-md">
            <FontAwesomeIcon icon={faTrash} className="text-white text-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-gray-900">
            Delete {itemType}?
          </h3>
          {itemName && (
            <p className="text-sm font-semibold text-gray-600 truncate max-w-[220px] mx-auto">
              {itemName}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-0.5">
            This is permanent and cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-1">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-rose-500 hover:bg-rose-600 active:translate-y-px text-white text-sm font-semibold shadow-md transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : null}
            Delete
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
