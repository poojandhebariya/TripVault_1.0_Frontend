import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface MobileStickyHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const MobileStickyHeader = ({
  title,
  onBack,
  rightAction,
}: MobileStickyHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky md:hidden top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack || (() => navigate(-1))}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h1 className="flex-1 text-base font-bold text-gray-900 truncate">
          {title}
        </h1>

        {rightAction && <div className="flex items-center">{rightAction}</div>}
      </div>
    </div>
  );
};

export default MobileStickyHeader;
