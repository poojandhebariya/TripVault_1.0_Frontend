import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faEnvelope, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../ui/modal";
import Input from "../../ui/input";
import Button from "../../ui/button";
import { clsx } from "clsx";

export const TwoFAModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<"setup" | "verify" | "done">("setup");
  const [method, setMethod] = useState<"app" | "email">("app");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => { setStep("setup"); setCode(""); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title="Two-Factor Authentication" icon={faShield} size="sm">
      {step === "setup" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Choose how to receive your verification codes.</p>
          <div className="space-y-2">
            {([
              { id: "app", label: "Authenticator App", desc: "Google Authenticator or Authy", icon: faShield },
              { id: "email", label: "Email OTP", desc: "Code sent to your registered email", icon: faEnvelope },
            ] as const).map((opt) => (
              <button key={opt.id} type="button" onClick={() => setMethod(opt.id)}
                className={clsx("w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                  method === opt.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center",
                  method === opt.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500")}>
                  <FontAwesomeIcon icon={opt.icon} className="text-sm" />
                </div>
                <div>
                  <p className={clsx("text-sm font-semibold", method === opt.id ? "text-blue-700" : "text-gray-800")}>{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <Button text={loading ? "Setting up…" : "Continue"} loading={loading} disabled={loading}
            onClick={async () => { setLoading(true); await new Promise(r => setTimeout(r, 900)); setLoading(false); setStep("verify"); }} />
        </div>
      )}
      {step === "verify" && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-blue-700">{method === "app" ? "Scan QR with your app" : "Check your inbox"}</p>
            {method === "app"
              ? <div className="w-28 h-28 mx-auto bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">QR Placeholder</div>
              : <p className="text-xs text-blue-500">A 6-digit code was sent to your email.</p>}
          </div>
          <Input label="Enter 6-digit code" placeholder="000000" value={code} maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <Button text={loading ? "Verifying…" : "Verify & Enable"} loading={loading} disabled={loading || code.length < 6}
            onClick={async () => { setLoading(true); await new Promise(r => setTimeout(r, 1000)); setLoading(false); setStep("done"); }} />
        </div>
      )}
      {step === "done" && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
          </div>
          <p className="font-semibold text-gray-800">2FA Enabled!</p>
          <p className="text-sm text-gray-400">Your account is now protected with two-factor authentication.</p>
          <Button text="Done" onClick={handleClose} />
        </div>
      )}
    </Modal>
  );
};
