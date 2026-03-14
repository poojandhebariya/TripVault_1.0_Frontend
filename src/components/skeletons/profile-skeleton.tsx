export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    <div className="h-52 lg:h-64 bg-gray-200 w-full" />
    <div className="hidden lg:flex justify-center px-4">
      <div className="w-full max-w-4xl -mt-12 bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex gap-8">
        <div className="h-28 w-28 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-3 mt-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
    <div className="lg:hidden px-4 mt-4 space-y-3">
      <div className="h-5 w-40 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-100 rounded" />
    </div>
  </div>
);
