import { Play, Read } from "@/components/icons"
import type { Dictionary } from "@/dictionaries"
import type { Locale } from "@/lib/i18n"
import type { ContentItem } from "@/lib/types"
import { formatDuration, readableDate } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export const CARD_BASE =
  "group flex rounded-lg border border-current/10 dark:border-current/20 hover:border-current/30 dark:hover:border-current/40 transition-all duration-300 motion-reduce:transition-none"

type CardLabels = Dictionary["card"]

const isExternal = (href: string) => /^https?:\/\//i.test(href)

// External targets (YouTube, dev.to) open in a new tab; internal ones (a post
// on this site) are client-side navigations.
function CardLink({
  href,
  className,
  title,
  children
}: {
  href: string
  className?: string
  title?: string
  children: React.ReactNode
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        title={title}
        className={className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} title={title} className={className}>
      {children}
    </Link>
  )
}

function Thumbnail({
  item,
  featured,
  priority = false,
  t,
  languageBadge
}: {
  item: ContentItem
  featured: boolean
  priority?: boolean
  t: CardLabels
  languageBadge?: string
}) {
  const { title, thumbnailUrl, videoUrl, articleUrl, durationSeconds } = item
  const isArticleOnly = !videoUrl && !!articleUrl

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        priority={priority}
        sizes={
          featured
            ? "(max-width: 768px) 100vw, 440px"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
        className="object-cover"
      />
      {(isArticleOnly || languageBadge) && (
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {isArticleOnly && (
            <span className="rounded-sm border border-current/20 bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-widest opacity-70">
              {t.article}
            </span>
          )}
          {languageBadge && (
            <span className="rounded-sm border border-current/20 bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-widest opacity-70">
              {languageBadge}
            </span>
          )}
        </div>
      )}
      {videoUrl && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`flex items-center justify-center rounded-full bg-black/55 text-white transition-transform duration-300 motion-reduce:transition-none group-hover:scale-110 motion-reduce:group-hover:scale-100 ${
              featured ? "h-16 w-16" : "h-11 w-11"
            }`}
          >
            <Play width={featured ? 24 : 18} height={featured ? 24 : 18} />
          </span>
        </span>
      )}
      {videoUrl && durationSeconds != null && (
        <span className="absolute bottom-2 right-2 rounded-sm bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
          {formatDuration(durationSeconds)}
        </span>
      )}
    </div>
  )
}

function Actions({
  item,
  featured,
  t
}: {
  item: ContentItem
  featured: boolean
  t: CardLabels
}) {
  const { videoUrl, articleUrl, readingMinutes } = item

  const compactActionClass =
    "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-current/20 min-h-11 px-3 py-2 text-[11px] uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity md:min-h-0 md:px-2 md:py-1"

  if (featured) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {videoUrl && (
          <CardLink
            href={videoUrl}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-foreground min-h-11 px-4 py-2.5 text-xs uppercase tracking-widest text-background hover:opacity-80 transition-opacity"
          >
            <Play width={14} height={14} /> {t.watch}
          </CardLink>
        )}
        {articleUrl && (
          <CardLink
            href={articleUrl}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-current/30 min-h-11 px-4 py-2.5 text-xs uppercase tracking-widest hover:border-current/60 transition-colors"
          >
            <Read width={14} height={14} /> {t.read}
          </CardLink>
        )}
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {videoUrl && (
        <CardLink href={videoUrl} className={compactActionClass}>
          <Play width={12} height={12} /> {t.watch}
        </CardLink>
      )}
      {articleUrl && (
        <CardLink href={articleUrl} className={compactActionClass}>
          <Read width={12} height={12} /> {t.read}
          {readingMinutes != null && (
            <span className="opacity-60">· {readingMinutes}m</span>
          )}
        </CardLink>
      )}
    </div>
  )
}

type Props = {
  item: ContentItem
  locale: Locale
  t: CardLabels
  featured?: boolean
  priority?: boolean
}

export function ContentCard({
  item,
  locale,
  t,
  featured = false,
  priority = false
}: Props) {
  const { title, date, description, readingMinutes, videoUrl, articleUrl } =
    item

  // Videos-first: the thumbnail/title open the video when there is one.
  const primary = videoUrl ?? articleUrl
  if (!primary) return null

  // Badge only when the video's language differs from the UI locale — a feed
  // that matches the reader's language stays unlabeled.
  const languageBadge =
    item.language && item.language !== locale
      ? item.language === "pt"
        ? "PT-BR"
        : "EN"
      : undefined

  if (featured) {
    return (
      <article
        className={`${CARD_BASE} flex-col md:flex-row gap-5 md:gap-6 p-5 md:p-6`}
      >
        <CardLink
          href={primary}
          title={title}
          className="block md:w-[440px] md:shrink-0"
        >
          <Thumbnail
            item={item}
            featured
            priority={priority}
            t={t}
            languageBadge={languageBadge}
          />
        </CardLink>
        <div className="flex flex-1 flex-col gap-3">
          <CardLink href={primary} title={title}>
            <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:opacity-80 transition-opacity">
              {title}
            </h2>
          </CardLink>
          {description && (
            <p className="opacity-50 text-sm md:text-base leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-widest opacity-60">
            <span>{readableDate(date, locale)}</span>
            {readingMinutes != null && (
              <span>
                · {readingMinutes} {t.minRead}
              </span>
            )}
          </div>
          <div className="mt-1 md:mt-auto">
            <Actions item={item} featured t={t} />
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`${CARD_BASE} flex-col gap-3 p-4`}>
      <CardLink href={primary} title={title} className="flex flex-col gap-3">
        <Thumbnail
          item={item}
          featured={false}
          priority={priority}
          t={t}
          languageBadge={languageBadge}
        />
        <h2 className="font-bold text-base md:text-lg leading-snug line-clamp-2 group-hover:opacity-80 transition-opacity">
          {title}
        </h2>
      </CardLink>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest opacity-60">
          {readableDate(date, locale)}
        </span>
        <Actions item={item} featured={false} t={t} />
      </div>
    </article>
  )
}
