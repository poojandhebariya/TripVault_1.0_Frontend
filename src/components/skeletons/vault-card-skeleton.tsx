import { cn } from "../../lib/cn-merge";
import { P } from "./skeleton-base";

interface VaultCardSkeletonProps {
  variant?: "mobile" | "desktop";
}

const VaultCardSkeleton = ({ variant = "desktop" }: VaultCardSkeletonProps) => {
  const isMobile = variant === "mobile";

  const wrapper = isMobile
    ? "bg-white border-b border-gray-100"
    : "bg-white rounded-2xl border border-gray-100 overflow-hidden";

  return (
    <div className={cn(wrapper, "animate-pulse")}>
      {/* ── Author row skeleton ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <P className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <P className="h-3.5 w-32" />
          <P className="h-2.5 w-20" />
        </div>
      </div>

      {/* ── Media area skeleton ── */}
      <P
        className={cn(
          "w-full bg-gray-200",
          isMobile ? "aspect-4/3 rounded-none" : "h-64 rounded-none",
        )}
      />

      {/* ── Engagement Bar skeleton ── */}
      <div className="px-4 py-3 flex gap-2">
        <P className="h-8 w-16 rounded-full" />
        <P className="h-8 w-16 rounded-full" />
        <P className="h-8 w-16 rounded-full" />
        <P className="h-8 w-8 rounded-full ml-auto" />
      </div>

      {/* ── Content skeleton ── */}
      <div className="px-4 pb-4 pt-1 space-y-2.5">
        <P className="h-5 w-3/4 rounded-lg" />
        <div className="space-y-1.5">
          <P className="h-3 w-full" />
          <P className="h-3 w-2/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 pt-1">
          <P className="h-6 w-14 rounded-full" />
          <P className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default VaultCardSkeleton;
