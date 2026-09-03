import Image from "next/image"
import Link from "next/link"

import { CARD_BASE } from "@/components/content-card"
import type { Dictionary } from "@/dictionaries"
import { blogArticlePath } from "@/lib/blog"
import type { Locale } from "@/lib/i18n"
import type { PublishedArticle } from "@/lib/types"
import { readableDate } from "@/lib/utils"

// dev.to cover banners are 1000×420. Decorative: the title sits next to it.
export function ArticleCover({
  src,
  sizes,
  priority = false
}: {
  src: string
  sizes: string
  priority?: boolean
}) {
  return (
    <div className="relative aspect-[1000/420] w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  )
}

type Props = {
  article: PublishedArticle
  locale: Locale
  t: Dictionary["card"]
  priority?: boolean
}

// One post in the /blog listing: cover on the left, title, excerpt and
// date · reading time on the right, in the featured ContentCard's frame.
export function ArticleCard({ article, locale, t, priority = false }: Props) {
  const href = blogArticlePath(locale, article.slug)
  const image = article.cover_image || article.social_image

  return (
    <article
      className={`${CARD_BASE} flex-col md:flex-row gap-5 md:gap-6 p-5 md:p-6`}
    >
      {image && (
        <Link
          href={href}
          title={article.title}
          className="block md:w-[360px] md:shrink-0"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ArticleCover
            src={image}
            sizes="(max-width: 768px) 100vw, 360px"
            priority={priority}
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3">
        <Link href={href}>
          <h2 className="text-xl md:text-2xl font-bold leading-tight group-hover:opacity-80 transition-opacity">
            {article.title}
          </h2>
        </Link>
        {article.description && (
          <p className="opacity-50 text-sm md:text-base leading-relaxed line-clamp-3">
            {article.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 text-xs uppercase tracking-widest opacity-60">
          <time dateTime={article.published_at}>
            {readableDate(article.published_at, locale)}
          </time>
          <span>
            · {article.reading_time_minutes} {t.minRead}
          </span>
        </div>
      </div>
    </article>
  )
}
