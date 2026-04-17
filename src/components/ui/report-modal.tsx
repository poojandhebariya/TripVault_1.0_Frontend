import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFlag,
  faSpinner,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./modal";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => void;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam", description: "Repetitive or unwanted content" },
  {
    id: "inappropriate_content",
    label: "Inappropriate content",
    description: "Offensive, explicit, or harmful material",
  },
  {
    id: "fake_location",
    label: "Fake location",
    description: "Misleading or fabricated place information",
  },
  {
    id: "copyright_issue",
    label: "Copyright issue",
    description: "Unauthorized use of protected content",
  },
];

const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setSelectedReason("");
    setComment("");
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason, comment);
    setSubmitted(true);
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={submitted ? undefined : "Report Post"}
      description={submitted ? undefined : "Help us understand what's wrong"}
      icon={submitted ? undefined : faFlag}
      size="md"
      variant="center"
    >
      {submitted ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-emerald-50" />
            <div className="absolute w-16 h-16 rounded-full bg-emerald-100" />
            <div className="relative w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="text-white text-lg"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-gray-900">Report sent</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Thanks for letting us know. We'll review this post and take
              action if it violates our community guidelines.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : (
        /* ── Report form ── */
        <div className="flex flex-col gap-4">
          {/* Reason selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {REPORT_REASONS.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full h-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {/* Radio circle */}
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? "border-rose-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${isSelected ? "text-rose-700" : "text-gray-800"}`}
                    >
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Additional context{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about this issue…"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || isLoading}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              )}
              Submit Report
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReportModal;
