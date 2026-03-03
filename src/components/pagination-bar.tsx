import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { Pagination } from "../pages/types/pagination";

export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: Pagination) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
        Prev
      </button>
      <span className="text-sm text-gray-500 font-medium">
        {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
      >
        Next
        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
      </button>
    </div>
  );
}
