// =============================================================================
// CineMatch — Movie Detail Page (Loading Skeleton)
// Premium cinematic loading state with shimmer animations
// =============================================================================

export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Backdrop skeleton */}
      <div className="relative w-full h-[60vh] bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content skeleton */}
      <div className="relative -mt-40 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster skeleton */}
          <div className="flex-shrink-0 w-[260px] h-[390px] rounded-2xl bg-muted/30 mx-auto md:mx-0" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-4 w-48 bg-muted/30 rounded-lg" />
            <div className="h-10 w-96 bg-muted/30 rounded-lg" />
            <div className="flex gap-3">
              <div className="h-8 w-20 bg-muted/30 rounded-full" />
              <div className="h-8 w-20 bg-muted/30 rounded-full" />
              <div className="h-8 w-20 bg-muted/30 rounded-full" />
            </div>
            <div className="h-4 w-full bg-muted/30 rounded-lg" />
            <div className="h-4 w-5/6 bg-muted/30 rounded-lg" />
            <div className="h-4 w-4/6 bg-muted/30 rounded-lg" />
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-40 bg-muted/30 rounded-xl" />
              <div className="h-12 w-40 bg-muted/30 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
