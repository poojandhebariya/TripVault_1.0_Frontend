import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Button from "../../ui/button";
import { useMutation } from "@tanstack/react-query";
import { vaultMutation } from "../../../tanstack/vault/mutation";

export const MakeAllPrivateModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { makeAllVaultsPrivateMutation } = vaultMutation();
  const makeAllPrivate = useMutation(makeAllVaultsPrivateMutation);

  const handleConfirm = () => {
    makeAllPrivate.mutate(undefined, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Make All Vaults Private"
      icon={faShieldHalved}
      size="sm"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} /> Privacy Update
          </p>
          <ul className="text-xs text-amber-600 space-y-1 list-disc ml-4 mt-2">
            <li>All your published trips will become invisible to the public.</li>
            <li>Only you will be able to see these vaults until you manually change them.</li>
            <li>This action will remove your vaults from global search and nearby feeds.</li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-600 px-1">
          Are you sure you want to make all your current vaults private? This action can be undone manually for each vault later.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="button"
            loading={makeAllPrivate.isPending}
            disabled={makeAllPrivate.isPending}
            onClick={handleConfirm}
            text="Make Private"
            className="flex-1 shadow-none flex items-center justify-center whitespace-nowrap"
          />
        </div>
      </div>
    </Modal>
  );
};
