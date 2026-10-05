import { blogArticlePath } from "./blog.ts"
import { siteLanguage } from "./i18n.ts"
import { site } from "./site.ts"
import type {
  Article,
  ContentItem,
  LatestVideo,
  VideoDetails
} from "./types.ts"

// Videos at or under this length are treated as Shorts and dropped from the feed.
// The API has no Shorts flag; this channel's Shorts are all <=65s and its shortest
// real video is 189s, so 180s (YouTube's own Shorts cap) is a clean cutoff. Tune
// here if a genuinely short long-form video ever gets hidden.
export const SHORTS_MAX_SECONDS = 180

// The originating video is explicit: body links may cite other creators or
// earlier videos. Shared by feed pairing and the /blog thumbnail lookup.
export function articleVideoIds(
  articles: { id: string; videoId?: string }[]
): Map<string, string> {
  const result = new Map<string, string>()
  for (const article of articles) {
    const videoId = article.videoId
    if (videoId) result.set(article.id, videoId)
  }
  return result
}

// A linked post can exist before release without being advertised. Missing
// video items (private videos are omitted by the public API) stay hidden too.
export function isVideoPublished(details: VideoDetails | undefined): boolean {
  return details?.isPublic === true && details.isUpcoming !== true
}

export function discoverableArticles<T extends { videoId?: string }>(
  articles: T[],
  details: Map<string, VideoDetails>
): T[] {
  return articles.filter(
    (article) =>
      !article.videoId || isVideoPublished(details.get(article.videoId))
  )
}

// Thumbnail of each post's linked video, keyed by post id. Posts without a
// video, or whose video the details map doesn't cover, are simply absent so
// the caller falls back to the post's own cover.
export function articleVideoThumbnails(
  articles: Article[],
  details: Map<string, VideoDetails>
): Map<string, string> {
  const result = new Map<string, string>()
  for (const [articleId, videoId] of articleVideoIds(articles)) {
    const url = details.get(videoId)?.thumbnailUrl
    if (url) result.set(articleId, url)
  }
  return result
}

// New video descriptions link to the site; legacy descriptions may link to Dev.to.
export function articleSlugFromDescription(description: string): string | null {
  for (const match of description.matchAll(/https?:\/\/[^\s)<>]+/g)) {
    try {
      const url = new URL(match[0])
      if (url.origin === site.url) {
        const slug = url.pathname.match(
          /^\/(?:en\/)?blog\/([a-z0-9-]+)\/?$/
        )?.[1]
        if (slug && slug !== "feed") return slug
      }
      if (url.hostname === "dev.to")
        return url.pathname.match(/^\/[\w-]+\/([\w-]+)/)?.[1] ?? null
    } catch {}
  }
  return null
}

// Many video descriptions open with a promo line ("Check my website: …"); skip
// those and return the first real sentence for the featured-card blurb.
const PROMO_LINE =
  /^(check|subscribe|join|watch|my website|courseshelf|http|►|🔗|link)/i

export function firstMeaningfulLine(text: string): string | undefined {
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (trimmed.length >= 40 && !PROMO_LINE.test(trimmed)) return trimmed
  }
  return undefined
}

// Details map with a channel-level language fallback applied: videos that
// don't declare a language on YouTube inherit their channel's language, so
// e.g. BR-channel uploads still get a language badge. Pure — returns a new
// map, never mutates the input.
export function withChannelLanguage(
  details: Map<string, VideoDetails>,
  videos: LatestVideo[],
  languageTag: string
): Map<string, VideoDetails> {
  const result = new Map(details)
  for (const video of videos) {
    const id = video.snippet.resourceId.videoId
    const existing = result.get(id)
    if (!existing) {
      result.set(id, { language: languageTag })
    } else if (!existing.language) {
      result.set(id, { ...existing, language: languageTag })
    }
  }
  return result
}

// Link to the locale route when available, otherwise the article's canonical URL.
export function articleUrl(article: Article): string {
  return article.language
    ? blogArticlePath(article.language, article.slug)
    : article.url
}

function videoToItem(
  video: LatestVideo,
  article: Article | undefined,
  details: VideoDetails | undefined
): ContentItem {
  const { title, publishedAt, thumbnails, resourceId, description } =
    video.snippet
  // `maxres` isn't generated for every upload; `medium` always is.
  const thumbnail = thumbnails.maxres ?? thumbnails.medium
  return {
    id: resourceId.videoId,
    title,
    date: publishedAt,
    thumbnailUrl: thumbnail.url,
    // Prefer the article's clean excerpt; fall back to the video's first real line.
    description: article?.description ?? firstMeaningfulLine(description ?? ""),
    durationSeconds: details?.durationSeconds,
    language: siteLanguage(details?.language),
    videoUrl: `https://www.youtube.com/watch?v=${resourceId.videoId}`,
    articleUrl: article ? articleUrl(article) : undefined,
    readingMinutes: article?.reading_time_minutes
  }
}

function articleToItem(article: Article, videoId: string | null): ContentItem {
  return {
    id: `article-${article.id}`,
    title: article.title,
    date: article.published_at,
    thumbnailUrl: article.cover_image || article.social_image || "",
    description: article.description,
    language: article.language,
    // The post may link a video that's older than the fetched window — still
    // offer "Watch" from the parsed id even though that video has no own card.
    videoUrl: videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : undefined,
    articleUrl: articleUrl(article),
    readingMinutes: article.reading_time_minutes
  }
}

function isShort(details: VideoDetails | undefined): boolean {
  const duration = details?.durationSeconds
  return duration !== undefined && duration <= SHORTS_MAX_SECONDS
}

// Merge YouTube uploads and local posts into one deduped, newest-first feed.
// Pair posts through videoId or a video's description link. Shorts and course-playlist
// videos are excluded. Pure (no I/O) so it can be unit-tested with fixtures.
export function buildContentFeed(
  videos: LatestVideo[],
  articles: Article[],
  courseVideoIds: Set<string>,
  details: Map<string, VideoDetails>
): ContentItem[] {
  const visibleArticles = discoverableArticles(articles, details)
  const videoIds = articleVideoIds(visibleArticles)
  const articleByVideoId = new Map<string, Article>()
  const articleBySlug = new Map<string, Article>()
  for (const article of visibleArticles) {
    articleBySlug.set(article.slug, article)
    const videoId = videoIds.get(article.id)
    if (videoId) articleByVideoId.set(videoId, article)
  }

  const usedArticleIds = new Set<string>()
  const items: ContentItem[] = []

  for (const video of videos) {
    const videoId = video.snippet.resourceId.videoId

    // Drop course videos (they have their own page) and Shorts (by duration —
    // keep anything whose duration is unknown rather than guess).
    if (courseVideoIds.has(videoId)) continue
    const videoDetails = details.get(videoId)
    // Scheduled premieres and live streams only get a card once they start,
    // the same gate their articles wait for, so a card never opens on a
    // waiting room.
    if (videoDetails?.isPublic === false || videoDetails?.isUpcoming) continue
    if (isShort(videoDetails)) continue

    let article = articleByVideoId.get(videoId)
    if (!article) {
      const slug = articleSlugFromDescription(video.snippet.description ?? "")
      if (slug) article = articleBySlug.get(slug)
    }
    if (article) usedArticleIds.add(article.id)
    items.push(videoToItem(video, article, videoDetails))
  }

  // Released posts outside the uploads window still get a card; pending posts
  // never reach this fallback. Standalone essays remain independent.
  for (const article of visibleArticles) {
    if (!usedArticleIds.has(article.id)) {
      items.push(articleToItem(article, videoIds.get(article.id) ?? null))
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return items
}
