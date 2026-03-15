import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faFireFlameCurved,
  faMountainSun,
  faLocationDot,
  faNoteSticky,
  faMapLocationDot,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import type { BucketList } from "../types/bucket-list";
import { useRemoveFromBucketList } from "../tanstack/bucket-list/mutation";
import DOMPurify from "dompurify";
import DeleteConfirmModal from "./ui/delete-confirm-modal";
import Button from "./ui/button";

interface BucketListCardProps {
  item: BucketList;
}

export default function BucketListCard({ item }: BucketListCardProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutate: remove, isPending } = useRemoveFromBucketList();

  const vault = item.vault;
  const image = vault.attachments.find((a) => a.type === "image")?.url;

  const labelObj = vault.location?.label
    ? vault.location.label.split(",")
    : ["Nowhere"];
  const country = labelObj[labelObj.length - 1].trim();

  // "Best Time" placeholder, derived from target year or hardcoded
  const bestTime = "Spring/Summer"; // Normally you'd want actual data for this

  const handleDelete = () => {
    remove(item.id);
  };

  const priorityColor =
    item.priority === "HIGH"
      ? "bg-red-50 text-red-600 border-red-200"
      : item.priority === "MEDIUM"
        ? "bg-orange-50 text-orange-600 border-orange-200"
        : "bg-blue-50 text-blue-600 border-blue-200";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group flex flex-col h-full">
      {/* ── Image & Tag ── */}
      <div
        className="h-48 relative cursor-pointer"
        onClick={() => navigate(`/vault/${vault.id}`)}
      >
        {image ? (
          <img
            src={image}
            alt={vault.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-tr from-blue-100 to-purple-100 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faMountainSun}
              className="text-4xl text-gray-300"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 right-3 flex auto-cols-auto gap-2 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            title="Remove"
            className="w-9 h-9 lg:w-8 lg:h-8 rounded-full bg-white/80 backdrop-blur-md text-gray-600 hover:bg-white hover:text-red-500 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrash} className="text-sm" />
          </button>
        </div>

        <h3 className="absolute bottom-4 left-4 right-4 text-white font-extrabold text-xl line-clamp-1 truncate drop-shadow-md">
          {vault.title}
        </h3>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* ── Priority, Country, Target Year ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${priorityColor}`}
          >
            <FontAwesomeIcon icon={faFireFlameCurved} />
            {item.priority}
          </span>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <FontAwesomeIcon icon={faLocationDot} />
            {country}
          </span>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
            <FontAwesomeIcon icon={faCalendarDay} />
            {item.targetYear}
          </span>
        </div>

        <div className="w-full h-px bg-gray-100" />

        {/* ── Note ── */}
        <div className="text-sm text-gray-500 line-clamp-3">
          <FontAwesomeIcon icon={faNoteSticky} className="text-gray-400 mr-2" />
          <span
            className="rich-editor-content inline"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                vault.description || "No notes available.",
              ),
            }}
          />
        </div>

        <div className="mt-auto w-full pt-2">
          {/* ── Extra Details Bottom Row ── */}
          <div className="mt-2 mb-4 text-[11px] font-semibold tracking-wider text-gray-400 flex items-center justify-between uppercase">
            <span>{bestTime}</span>
            <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          {/* ── Plan This Trip Button ── */}
          <Button
            onClick={() =>
              navigate(`/user/profile/bucket-list?vault=${vault.id}`)
            }
            variant="outline"
            outlineClassName="w-full"
            className="w-full items-center justify-center"
            icon={faMapLocationDot}
            text="Plan this trip"
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        itemName={vault.title}
        itemType="bucket list item"
        isLoading={isPending}
      />
    </div>
  );
}
