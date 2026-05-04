import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/constants";

export const DeleteAccountModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm !== "DELETE") return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // TODO: wire API
    navigate(ROUTES.AUTH.SIGN_IN);
  };

  return (
    <Modal open={open} onClose={() => { setConfirm(""); onClose(); }}
      title="Delete Account" icon={faTriangleExclamation} size="sm">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} /> This action is permanent
          </p>
          <ul className="text-xs text-red-600 space-y-1 list-disc ml-4 mt-2">
            <li>All your vaults and posts will be deleted</li>
            <li>Your bucket list and travel data will be removed</li>
            <li>Your followers / following relationships will be lost</li>
            <li>This cannot be undone</li>
          </ul>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE"
            className="px-3 py-2.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-200 text-sm transition-all" />
        </div>
        <button type="button" disabled={confirm !== "DELETE" || loading} onClick={handleDelete}
          className="w-full py-3 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 active:translate-y-px transition-all cursor-pointer flex items-center justify-center gap-2">
          {loading && <FontAwesomeIcon icon={faSpinner} spin />}
          {loading ? "Deleting…" : "Permanently Delete Account"}
        </button>
      </div>
    </Modal>
  );
};
