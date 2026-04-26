import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Button from "../../ui/button";
import { authMutation } from "../../../tanstack/auth/mutation";

export const DisableTwoFAModal = ({
  open,
  onClose,
  onDisabled,
}: {
  open: boolean;
  onClose: () => void;
  onDisabled?: () => void;
}) => {
  const { twoFaDisableMutation } = authMutation();
  const { mutate: disable, isPending } = useMutation({
    ...twoFaDisableMutation,
    onSuccess: () => {
      onDisabled?.();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Disable 2FA" icon={faShieldHalved} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-orange-700">
            Disabling two-factor authentication will make your account less secure. Anyone with your password will be able to sign in without an extra code.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Keep 2FA On
          </button>
          <button
            type="button"
            onClick={() => disable()}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isPending ? "Disabling…" : "Disable 2FA"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
