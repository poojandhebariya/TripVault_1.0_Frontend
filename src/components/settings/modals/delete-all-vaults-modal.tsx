import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { useMutation } from "@tanstack/react-query";
import { vaultMutation } from "../../../tanstack/vault/mutation";

export const DeleteAllVaultsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [confirm, setConfirm] = useState("");
  const { deleteAllVaultsMutation } = vaultMutation();
  const deleteVaults = useMutation(deleteAllVaultsMutation);

  const handleDelete = () => {
    if (confirm !== "DELETE ALL") return;
    deleteVaults.mutate(undefined, {
      onSuccess: () => {
        setConfirm("");
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm("");
        onClose();
      }}
      title="Delete All Vaults"
      icon={faTriangleExclamation}
      size="sm"
    >
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} /> This action is
            permanent
          </p>
          <ul className="text-xs text-red-600 space-y-1 list-disc ml-4 mt-2">
            <li>Every memory in your vault will be permanently removed</li>
            <li>
              All impressions, likes, and comments on your vaults will be lost
            </li>
            <li>This action cannot be undone</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Type <span className="font-bold text-red-600">DELETE ALL</span> to
            confirm
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE ALL"
            className="px-3 py-2.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-200 text-sm transition-all"
          />
        </div>
        <button
          type="button"
          disabled={confirm !== "DELETE ALL" || deleteVaults.isPending}
          onClick={handleDelete}
          className="w-full py-3 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {deleteVaults.isPending && <FontAwesomeIcon icon={faSpinner} spin />}
          {deleteVaults.isPending
            ? "Deleting…"
            : "Permanently Delete All Vaults"}
        </button>
      </div>
    </Modal>
  );
};
