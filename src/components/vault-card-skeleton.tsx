interface Props {
  variant?: "mobile" | "desktop";
}

const VaultCardSkeleton = ({ variant = "desktop" }: Props) => {
  const isMobile = variant === "mobile";
  const wrapper = isMobile
    ? "bg-white border-b border-gray-100 animate-pulse"
    : "bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse";

  return (
    <div className={wrapper}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-2.5 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className={`bg-gray-200 w-full ${isMobile ? "h-72" : "h-64"}`} />
      <div className="px-4 py-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="px-4 pb-4 pt-3 border-t border-gray-50 flex gap-2">
        <div className="h-7 bg-gray-100 rounded-full w-16" />
        <div className="h-7 bg-gray-100 rounded-full w-16" />
        <div className="h-7 bg-gray-100 rounded-full w-16" />
        <div className="h-7 bg-gray-100 rounded-full w-8 ml-auto" />
      </div>
    </div>
  );
};

export default VaultCardSkeleton;
