import { useState } from "react";
import Modal from "./modal";
import Button from "./button";
import { useAddToBucketList } from "../../tanstack/bucket-list/mutation";
import type { BucketListRequestDto } from "../../types/bucket-list";

interface BucketListModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
}

export default function BucketListModal({ isOpen, onClose, vaultId }: BucketListModalProps) {
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear() + 1);
  const [priority, setPriority] = useState<string>("MEDIUM");

  const { mutate, isPending } = useAddToBucketList();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { vaultId, data: { targetYear, priority } as BucketListRequestDto },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Add to Bucket List">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        <p className="text-gray-600 text-sm">
          Plan ahead! When do you want to visit this place and how high is it on your list?
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Target Year</label>
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-hidden transition-colors cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Priority Level</label>
          <div className="flex items-center gap-3">
            {["HIGH", "MEDIUM", "LOW"].map((level) => (
              <label
                key={level}
                className={`flex-1 py-3 border rounded-xl md:text-base text-sm text-center font-medium cursor-pointer transition-colors ${
                  priority === level
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={level}
                  checked={priority === level}
                  onChange={() => setPriority(level)}
                  className="hidden"
                />
                {level === "HIGH" ? "🔥 High" : level === "MEDIUM" ? "⭐️ Medium" : "🌱 Low"}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button
            text="Save to Bucket List"
            type="submit"
            className="w-full py-3"
            disabled={isPending}
          />
        </div>
      </form>
    </Modal>
  );
}
