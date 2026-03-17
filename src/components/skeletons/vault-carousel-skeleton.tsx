import { P } from "./skeleton-base";

const VaultCarouselSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:gap-8 overflow-x-auto pb-4 px-1 no-scrollbar">
    {Array.from({ length: count }).map((_, i) => (
      <P
        key={i}
        className="shrink-0 w-full md:w-[280px] h-[240px] sm:h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100"
      />
    ))}
  </div>
);

export default VaultCarouselSkeleton;
