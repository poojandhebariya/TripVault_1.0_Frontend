import { P } from "./skeleton-base";

const VaultDetailSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    {/* Mobile sticky header skeleton (if visible) */}
    <div className="sticky top-0 z-40 bg-white/95 border-b border-gray-100 h-14 md:hidden" />

    <div className="max-w-7xl mx-auto md:py-8 md:px-6 xl:px-8">
      <div className="flex flex-col lg:flex-row lg:gap-12">
        {/* Left Column (Main Content) */}
        <div className="flex-1 min-w-0">
          {/* Desktop Title (above image) – matched hidden lg:block */}
          <div className="hidden lg:block mb-6 mt-2 space-y-3">
            <P className="h-10 w-3/4 max-w-lg rounded-xl" />
          </div>

          {/* Author Inline (matched padding/margins from VaultDetail) */}
          <div className="flex items-center gap-3 py-3 px-4 md:px-0! mb-3 md:mb-5">
            <P className="w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <P className="h-4 w-32" />
              <P className="h-3 w-40" />
            </div>
            <P className="h-9 w-24 rounded-full" />
          </div>

          {/* Media Carousel (Hero Area) */}
          <P className="w-full md:rounded-2xl aspect-4/3 max-h-[450px]" />

          {/* Engagement Bar skeleton – matched py/border/px */}
          <div className="flex items-center gap-2 py-3 border-y border-gray-100 my-4 md:my-5 px-4 md:px-0">
            <P className="w-20 h-9 rounded-full" />
            <P className="w-20 h-9 rounded-full" />
            <P className="w-20 h-9 rounded-full" />
            <P className="ml-auto w-9 h-9 rounded-full shrink-0" />
          </div>

          {/* Tab Selection Area */}
          <div className="mt-2 md:mt-4 px-4 md:px-0 space-y-6">
            <div className="flex gap-4 border-b border-gray-100 pb-3">
              <P className="w-24 h-8 rounded-full" />
              <P className="w-20 h-8 rounded-full" />
              <P className="w-24 h-8 rounded-full" />
            </div>

            {/* Content for "Details" tab (default) */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <P className="h-3 w-32" />
                <div className="flex gap-2">
                  <P className="h-8 w-24 rounded-full" />
                  <P className="h-8 w-28 rounded-full" />
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                <P className="h-4 w-full" />
                <P className="h-4 w-full" />
                <P className="h-4 w-5/6" />
                <P className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Ads space) – matched w-full lg:w-[380px] */}
        <div className="w-full lg:w-[380px] shrink-0 px-4 md:px-0 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            <P className="w-full h-[600px] rounded-[32px] md:rounded-3xl" />
          </div>
        </div>
      </div>

      {/* Explore More Row at bottom */}
      <div className="mt-12 md:mt-24 pt-8 md:pt-12 border-t border-gray-100 px-4 md:px-0">
        <div className="mb-8 space-y-3 px-4 md:px-0">
          <P className="h-8 w-64 rounded-xl" />
          <P className="h-4 w-80 rounded-lg opacity-60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`space-y-4 ${i > 1 ? "hidden md:block" : ""} ${i > 2 ? "lg:block" : ""}`}
            >
              <P className="aspect-4/3 rounded-2xl w-full" />
              <div className="space-y-2">
                <P className="h-4 w-3/4 rounded-lg" />
                <P className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default VaultDetailSkeleton;
