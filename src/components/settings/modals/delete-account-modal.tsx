import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { authMutation } from "../../../tanstack/auth/mutation";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "react-snackify";

export const DeleteAccountModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [confirm, setConfirm] = useState("");
  const { showSnackbar } = useSnackbar();
  const { deleteAccountMutation } = authMutation();
  const deleteAccount = useMutation({
    ...deleteAccountMutation,
    onError: (error: any) => {
      showSnackbar({
        message: error.response?.data?.message || "Failed to delete account",
        variant: "error",
      });
    },
  });

  const handleDelete = () => {
    if (confirm !== "DELETE") return;
    deleteAccount.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm("");
        onClose();
      }}
      title="Delete Account"
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
            <li>All your vaults and posts will be deleted</li>
            <li>Your bucket list and travel data will be removed</li>
            <li>Your followers / following relationships will be lost</li>
            <li>This cannot be undone</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Type <span className="font-bold text-red-600">DELETE</span> to
            confirm
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="px-3 py-2.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-200 text-sm transition-all"
          />
        </div>
        <button
          type="button"
          disabled={confirm !== "DELETE" || deleteAccount.isPending}
          onClick={handleDelete}
          className="w-full py-3 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {deleteAccount.isPending && <FontAwesomeIcon icon={faSpinner} spin />}
          {deleteAccount.isPending ? "Deleting…" : "Permanently Delete Account"}
        </button>
      </div>
    </Modal>
  );
};
