import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faEnvelope, faCheckCircle, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { authMutation } from "../../../tanstack/auth/mutation";

export const TwoFAModal = ({
  open,
  onClose,
  onEnabled,
}: {
  open: boolean;
  onClose: () => void;
  onEnabled?: () => void;
}) => {
  const [step, setStep] = useState<"info" | "verify" | "done">("info");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const { twoFaSetupMutation, twoFaVerifyMutation } = authMutation();

  const { mutate: setup, isPending: isSettingUp } = useMutation({
    ...twoFaSetupMutation,
    onSuccess: () => setStep("verify"),
    // errors go to global snackbar via MutationCache
  });

  const { mutate: verify, isPending: isVerifying } = useMutation({
    ...twoFaVerifyMutation,
    onSuccess: () => {
      setStep("done");
      onEnabled?.();
    },
  });

  const handleClose = () => {
    setStep("info");
    setCode("");
    setCodeError("");
    onClose();
  };

  const handleVerify = () => {
    if (code.length !== 6) { setCodeError("Please enter a 6-digit code."); return; }
    setCodeError("");
    verify({ code });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Two-Factor Authentication" icon={faShield} size="sm">
      {/* ── Step 1: info + send code ── */}
      {step === "info" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="text-white text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Email OTP</p>
              <p className="text-xs text-blue-600 mt-0.5">
                A 6-digit verification code will be sent to your registered email address. Enter it to confirm and enable 2FA.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Once enabled, you will be asked for this code on each login.
            The code expires in <strong>10 minutes</strong>.
          </p>
          <Button
            text={isSettingUp ? "Sending code…" : "Send Verification Code"}
            loading={isSettingUp}
            disabled={isSettingUp}
            onClick={() => setup()}
          />
        </div>
      )}

      {/* ── Step 2: enter code ── */}
      {step === "verify" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-blue-700">Check your inbox</p>
            <p className="text-xs text-blue-500">
              A 6-digit code was sent to your registered email. It expires in 10 minutes.
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
            text={isVerifying ? "Verifying…" : "Verify & Enable 2FA"}
            loading={isVerifying}
            disabled={isVerifying || code.length < 6}
            onClick={handleVerify}
          />
          <button
            type="button"
            onClick={() => setup()}
            disabled={isSettingUp}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotateRight} className={isSettingUp ? "animate-spin" : ""} />
            {isSettingUp ? "Resending…" : "Resend code"}
          </button>
        </div>
      )}

      {/* ── Step 3: success ── */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
          </div>
          <p className="font-semibold text-gray-800">2FA Enabled!</p>
          <p className="text-sm text-gray-400">
            Your account is now protected with two-factor authentication.
          </p>
          <Button text="Done" onClick={handleClose} />
        </div>
      )}
    </Modal>
  );
};
