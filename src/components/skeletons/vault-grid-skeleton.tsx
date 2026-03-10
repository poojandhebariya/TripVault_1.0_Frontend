import { P } from "./skeleton-base";

const VaultGridSkeleton = ({ count = 9 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <P
        key={i}
        className="aspect-square rounded-none bg-gray-100"
        style={{ animationDelay: `${i * 55}ms` }}
      />
    ))}
  </>
);

export default VaultGridSkeleton;
