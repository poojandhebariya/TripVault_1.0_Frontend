import { P } from "./skeleton-base";

const VaultCarouselSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar">
    {Array.from({ length: count }).map((_, i) => (
      <P
        key={i}
        className="shrink-0 w-[260px] md:w-[280px] h-[360px] md:h-[400px] rounded-3xl bg-gray-100 border border-gray-100"
      />
    ))}
  </div>
);

export default VaultCarouselSkeleton;
