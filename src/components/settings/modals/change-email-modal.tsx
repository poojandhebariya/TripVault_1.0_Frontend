import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCheckCircle,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { authMutation } from "../../../tanstack/auth/mutation";

interface Props {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
  currentEmail?: string;
}

export const ChangeEmailModal = ({ open, onClose, onChanged, currentEmail }: Props) => {
  const [step, setStep] = useState<"enter" | "verify" | "done">("enter");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const { changeEmailInitiateMutation, changeEmailConfirmMutation } = authMutation();

  const { mutate: initiate, isPending: isInitiating } = useMutation({
    ...changeEmailInitiateMutation,
    onSuccess: () => setStep("verify"),
  });

  const { mutate: confirm, isPending: isConfirming } = useMutation({
    ...changeEmailConfirmMutation,
    onSuccess: () => {
      setStep("done");
      onChanged?.();
    },
  });

  const handleClose = () => {
    setStep("enter");
    setNewEmail("");
    setEmailError("");
    setCode("");
    setCodeError("");
    onClose();
  };

  const handleInitiate = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) { setEmailError("Please enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (trimmed.toLowerCase() === currentEmail?.toLowerCase()) {
      setEmailError("New email must be different from your current email.");
      return;
    }
    setEmailError("");
    initiate({ newEmail: trimmed });
  };

  const handleConfirm = () => {
    if (code.length !== 6) { setCodeError("Please enter the 6-digit code."); return; }
    setCodeError("");
    confirm({ code, newEmail: newEmail.trim() });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Change Email" icon={faEnvelope} size="sm">

      {/* ── Step 1: enter new email ── */}
      {step === "enter" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Verify your new email</p>
              <p className="text-xs text-blue-600 mt-0.5">
                We'll send a 6-digit code to your new address. You must confirm it before the change takes effect.
              </p>
            </div>
          </div>

          {currentEmail && (
            <div className="text-xs text-gray-400">
              Current email: <span className="font-medium text-gray-600">{currentEmail}</span>
            </div>
          )}

          <Input
            label="New Email Address"
            type="email"
            placeholder="you@example.com"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setEmailError("");
            }}
            error={emailError}
          />

          <Button
            text={isInitiating ? "Sending code…" : "Send Verification Code"}
            loading={isInitiating}
            disabled={isInitiating}
            onClick={handleInitiate}
          />
        </div>
      )}

      {/* ── Step 2: enter OTP ── */}
      {step === "verify" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-blue-700">Check your new inbox</p>
            <p className="text-xs text-blue-500">
              A 6-digit code was sent to{" "}
              <span className="font-semibold">{newEmail}</span>. It expires in 15 minutes.
            </p>
          </div>

          <Input
            label="Verification Code"
            placeholder="000000"
            value={code}
            maxLength={6}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setCode(val);
              if (val.length === 6) setCodeError("");
            }}
            error={codeError}
          />

          <Button
            text={isConfirming ? "Confirming…" : "Confirm & Change Email"}
            loading={isConfirming}
            disabled={isConfirming || code.length < 6}
            onClick={handleConfirm}
          />

          <button
            type="button"
            onClick={() => initiate({ newEmail: newEmail.trim() })}
            disabled={isInitiating}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotateRight} className={isInitiating ? "animate-spin" : ""} />
            {isInitiating ? "Resending…" : "Resend code"}
          </button>
        </div>
      )}

      {/* ── Step 3: success ── */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
          </div>
          <p className="font-semibold text-gray-800">Email Updated!</p>
          <p className="text-sm text-gray-400">
            Your account email has been changed to{" "}
            <span className="font-medium text-gray-600">{newEmail}</span>.
          </p>
          <Button text="Done" onClick={handleClose} />
        </div>
      )}
    </Modal>
  );
};
