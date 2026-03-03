import { useState, useEffect } from "react";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import Button from "./ui/button";
import Modal from "./ui/modal";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dt: string) => void;
}

const ScheduleModal = ({ open, onClose, onConfirm }: ScheduleModalProps) => {
  const [dt, setDt] = useState("");

  // Reset datetime input when modal opens
  useEffect(() => {
    if (open) {
      setDt("");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Post"
      description="Choose when to publish your vault"
      icon={faCalendarDays}
      size="sm"
    >
      <div className="space-y-4">
        <input
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-700 transition-all cursor-pointer"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer w-1/2"
          >
            Cancel
          </button>
          <Button
            text="Confirm"
            disabled={!dt}
            onClick={() => {
              onConfirm(dt);
              onClose();
            }}
            className="py-2.5 rounded-md text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer w-1/2"
          />
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
