function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-current/10 dark:bg-current/15 ${className}`}
      aria-hidden="true"
    />
  )
}

const skeletonKeys = {
  four: ["social-1", "social-2", "social-3", "social-4"],
  three: ["card-1", "card-2", "card-3"],
  two: ["row-1", "row-2"]
} as const

export function ContentCardSkeleton({
  featured = false
}: {
  featured?: boolean
}) {
  if (featured) {
    return (
      <div
        className="flex flex-col md:flex-row gap-5 md:gap-6 p-5 md:p-6 rounded-lg border border-current/10 dark:border-current/20"
        aria-hidden="true"
      >
        <Pulse className="aspect-video w-full md:w-[440px] md:shrink-0" />
        <div className="flex flex-1 flex-col gap-3">
          <Pulse className="h-7 w-3/4" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-3 w-1/3 mt-2" />
          <div className="flex gap-3 mt-2">
            <Pulse className="h-9 w-24" />
            <Pulse className="h-9 w-20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg border border-current/10 dark:border-current/20"
      aria-hidden="true"
    >
      <Pulse className="aspect-video w-full" />
      <Pulse className="h-5 w-full" />
      <Pulse className="h-5 w-2/3" />
      <div className="flex justify-between">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-7 w-16" />
      </div>
    </div>
  )
}

export function HomeLoadingSkeleton() {
  return (
    <div className="my-14 md:my-28 max-w-4xl mx-auto flex flex-col gap-14 md:gap-20">
      <div
        className="w-auto md:w-[560px] mx-auto flex flex-col gap-5"
        aria-hidden="true"
      >
        <Pulse className="h-12 w-32" />
        <Pulse className="h-6 w-full" />
        <Pulse className="h-6 w-4/5" />
        <Pulse className="h-4 w-28 mt-2" />
        <div className="flex gap-4 mt-4">
          {skeletonKeys.four.map((key) => (
            <Pulse key={key} className="h-6 w-6 rounded-full" />
          ))}
        </div>
        <div className="flex gap-12 py-6">
          <Pulse className="h-10 w-24" />
          <Pulse className="h-10 w-24" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <Pulse className="h-8 w-40" />
          <Pulse className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skeletonKeys.three.map((key) => (
            <ContentCardSkeleton key={key} />
          ))}
        </div>
      </div>

      <Pulse className="h-32 w-full rounded-lg" />
    </div>
  )
}

export function VideosLoadingSkeleton() {
  return (
    <div className="my-14 md:my-28 max-w-5xl mx-auto flex flex-col gap-5">
      <div aria-hidden="true">
        <Pulse className="h-10 w-32 mb-4" />
        <Pulse className="h-4 w-full max-w-2xl mb-2" />
        <Pulse className="h-4 w-3/4 max-w-xl mb-6" />
        <Pulse className="h-11 w-full rounded-lg mb-5" />
      </div>
      <div className="flex flex-col gap-4">
        {skeletonKeys.two.map((key) => (
          <ContentCardSkeleton key={key} featured />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonKeys.three.map((key) => (
          <ContentCardSkeleton key={key} />
        ))}
      </div>
    </div>
  )
}

export function BlogLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {skeletonKeys.three.map((key) => (
        <div
          key={key}
          className="flex flex-col md:flex-row gap-5 md:gap-6 p-5 md:p-6 rounded-lg border border-current/10 dark:border-current/20"
        >
          <Pulse className="aspect-[1000/420] w-full md:w-[360px] md:shrink-0" />
          <div className="flex flex-1 flex-col gap-3">
            <Pulse className="h-7 w-3/4" />
            <Pulse className="h-4 w-full" />
            <Pulse className="h-4 w-5/6" />
            <Pulse className="h-3 w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CoursesLoadingSkeleton() {
  return (
    <div className="my-14 md:my-28 max-w-[978px] mx-auto flex flex-col gap-6">
      <div aria-hidden="true">
        <Pulse className="h-10 w-36 mb-4" />
        <Pulse className="h-4 w-full max-w-2xl mb-2" />
        <Pulse className="h-4 w-2/3 max-w-xl mb-6" />
      </div>
      <div className="flex flex-col gap-4">
        {skeletonKeys.two.map((key) => (
          <Pulse key={key} className="h-48 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {skeletonKeys.three.map((key) => (
          <Pulse key={key} className="h-56 w-[270px] rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function ContentFeedSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <Pulse className="h-11 w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        {skeletonKeys.two.map((key) => (
          <ContentCardSkeleton key={key} featured />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonKeys.three.map((key) => (
          <ContentCardSkeleton key={key} />
        ))}
      </div>
    </div>
  )
}
