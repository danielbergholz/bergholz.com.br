import Image from "next/image"
import type { Dictionary } from "@/dictionaries"
import type { Video as VideoType } from "@/lib/types"

type Props = {
  video: VideoType
  // Language the course is taught in (badge), independent of the UI locale.
  language: "en" | "pt"
  t: Dictionary["video"]
  featured?: boolean
  newCourse?: boolean
}

export function Video({
  video,
  language,
  t,
  featured = false,
  newCourse = false
}: Props) {
  const { title, description, thumbnails } = video.snippet
  const { itemCount } = video.contentDetails
  const thumbnail = featured ? thumbnails.maxres : thumbnails.medium

  // Render at a fixed display width, deriving the height from the thumbnail's
  // own aspect ratio so next/image reserves the correct space (no layout shift)
  // and never receives a distorted — or negative — height.
  const displayWidth = featured ? 380 : 270
  const displayHeight = Math.round(
    displayWidth * (thumbnail.height / thumbnail.width)
  )

  const languageBadge = language === "pt" ? "PT-BR" : "EN"

  return featured ? (
    <a
      rel="noreferrer noopener"
      target="_blank"
      href={`https://www.youtube.com/playlist?list=${video.id}`}
      title={title}
      className="group border border-current/10 dark:border-current/20 rounded-lg p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 hover:border-current/30 dark:hover:border-current/40 transition-all duration-300 motion-reduce:transition-none max-w-[306px] sm:max-w-full"
    >
      <div className="flex flex-col justify-between h-full order-2 md:order-1 gap-2 sm:gap-4">
        <div className="flex items-center justify-between md:justify-normal md:gap-3">
          <h2 className="font-bold text-lg md:text-xl group-hover:opacity-80 transition-opacity">
            {title}
          </h2>
          <span className="text-xs uppercase tracking-widest opacity-60 border border-current/20 dark:border-current/30 rounded-sm px-2 py-0.5 shrink-0">
            {languageBadge}
          </span>
        </div>

        <p className="opacity-50 text-sm md:text-base leading-relaxed">
          {description}
        </p>

        <div className="flex justify-between items-center">
          <p>
            <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-sm px-2 py-0.5 mr-2">
              {t.free}
            </span>
            {newCourse && (
              <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded-sm px-2 py-0.5">
                {t.new}
              </span>
            )}
          </p>
          <p className="opacity-60 text-xs md:text-sm tracking-wide">
            {itemCount} {itemCount === 1 ? t.videoSingular : t.videoPlural}
          </p>
        </div>
      </div>
      <Image
        src={thumbnail.url}
        alt={title}
        width={displayWidth}
        height={displayHeight}
        className="rounded-lg order-1 md:order-2"
      />
    </a>
  ) : (
    <a
      rel="noreferrer noopener"
      target="_blank"
      href={`https://www.youtube.com/playlist?list=${video.id}`}
      title={title}
      className="group border border-current/10 dark:border-current/20 rounded-lg p-4 flex flex-col items-center gap-4 hover:border-current/30 dark:hover:border-current/40 transition-all duration-300 motion-reduce:transition-none"
    >
      <Image
        src={thumbnail.url}
        alt={title}
        width={displayWidth}
        height={displayHeight}
        className="rounded-lg"
      />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg min-w-0 flex-1 group-hover:opacity-80 transition-opacity">
            {title}
          </h2>
          <span className="text-xs uppercase tracking-widest opacity-60 border border-current/20 dark:border-current/30 rounded-sm px-2 py-0.5 shrink-0">
            {languageBadge}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-sm px-2 py-0.5">
            {t.free}
          </span>
          <p className="opacity-60 text-xs tracking-wide">
            {itemCount} {itemCount === 1 ? t.videoSingular : t.videoPlural}
          </p>
        </div>
      </div>
    </a>
  )
}
