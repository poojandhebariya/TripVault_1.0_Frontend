import { cn } from "../../lib/cn-merge";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A reusable Shimmer/Skeleton primitive.
 */
export const P = ({ className, style }: SkeletonProps) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-200 rounded-md", className)}
      style={style}
    />
  );
};
