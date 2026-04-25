import { useState } from "react";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Button from "../../ui/button";

export const DeactivateModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <Modal open={open} onClose={() => { setDone(false); onClose(); }} title="Deactivate Account" icon={faRightFromBracket} size="sm">
      {done ? (
        <div className="text-center py-4 space-y-2">
          <p className="font-semibold text-gray-800">Account deactivated</p>
          <p className="text-sm text-gray-400">You can reactivate by logging in again.</p>
          <Button text="Done" className="mt-2" onClick={() => { setDone(false); onClose(); }} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Deactivating hides your profile and content from others. You can reactivate at any time by logging in again.
          </p>
          <Button text={loading ? "Deactivating…" : "Deactivate Account"} loading={loading} disabled={loading}
            onClick={async () => {
              setLoading(true);
              await new Promise(r => setTimeout(r, 1200)); // TODO: wire API
              setLoading(false);
              setDone(true);
            }} />
        </div>
      )}
    </Modal>
  );
};
