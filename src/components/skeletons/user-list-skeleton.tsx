export const UserListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="flex flex-col gap-0">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded-full w-2/5" />
          <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        </div>
        <div className="w-20 h-8 bg-gray-100 rounded-full shrink-0" />
      </div>
    ))}
  </div>
);
