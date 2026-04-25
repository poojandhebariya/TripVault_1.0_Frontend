import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Button from "../../ui/button";
import Password from "../../ui/password";
import { authMutation } from "../../../tanstack/auth/mutation";
import { validatePassword } from "../../../utils/password-validation";

export const ChangePasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [newPassError, setNewPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [success, setSuccess] = useState(false);

  const { changePasswordMutation } = authMutation();
  const { mutate, isPending } = useMutation({
    ...changePasswordMutation,
    onSuccess: () => setSuccess(true),
    // API errors are handled globally by MutationCache in App.tsx (snackbar)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(form.newPass);
    setNewPassError(pwdError ?? "");
    const mismatch = form.newPass !== form.confirm ? "Passwords do not match." : "";
    setConfirmError(mismatch);
    if (pwdError || mismatch) return;
    mutate({ currentPassword: form.current, newPassword: form.newPass });
  };

  const handleClose = () => {
    setForm({ current: "", newPass: "", confirm: "" });
    setNewPassError("");
    setConfirmError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Change Password" icon={faKey} size="md">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
          </div>
          <p className="font-semibold text-gray-800">Password updated!</p>
          <p className="text-sm text-gray-400">Your password has been changed successfully.</p>
          <Button text="Done" className="mt-2" onClick={handleClose} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Password label="Current Password" placeholder="Enter current password"
            value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required />
          <Password label="New Password" placeholder="Min 8 chars, upper, lower, digit, special"
            value={form.newPass}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, newPass: val });
              setNewPassError(validatePassword(val) ?? "");
              if (form.confirm) setConfirmError(val !== form.confirm ? "Passwords do not match." : "");
            }}
            error={newPassError}
            required />
          <Password label="Confirm New Password" placeholder="Repeat new password"
            value={form.confirm}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, confirm: val });
              setConfirmError(val !== form.newPass ? "Passwords do not match." : "");
            }}
            error={confirmError}
            required />
          <Button type="submit" text={isPending ? "Updating…" : "Update Password"} loading={isPending} disabled={isPending} />
        </form>
      )}
    </Modal>
  );
};
