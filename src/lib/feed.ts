import type {
  Article,
  ContentItem,
  LatestVideo,
  VideoDetails
} from "@/lib/types"
import { isOnOrAfterCollabStart } from "./youtube-collabs.ts"

// Videos at or under this length are treated as Shorts and dropped from the feed.
// The API has no Shorts flag; this channel's Shorts are all <=65s and its shortest
// real video is 189s, so 180s (YouTube's own Shorts cap) is a clean cutoff. Tune
// here if a genuinely short long-form video ever gets hidden.
export const SHORTS_MAX_SECONDS = 180

// Pull a YouTube video id out of a dev.to post body: raw watch/short URLs plus
// dev.to's liquid embeds ({% youtube ID %} and {% embed <url> %}).
const VIDEO_ID_PATTERNS = [
  /youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]{11})/i,
  /\{%\s*youtube\s+([\w-]{11})/i,
  /\{%\s*embed\s+https?:\/\/youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]{11})/i
]

export function videoIdFromBody(body: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = body.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Pull the dev.to article slug out of a video description (last path segment of
// a dev.to/<user>/<slug> link).
export function articleSlugFromDescription(description: string): string | null {
  return description.match(/dev\.to\/[\w-]+\/([\w-]+)/i)?.[1] ?? null
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

// Collapse YouTube's BCP-47 tag ("en", "en-US", "pt-BR") to the site's two
// languages; anything else (or unset) is unknown and gets no badge.
export function siteLanguage(tag: string | undefined): "en" | "pt" | undefined {
  const primary = tag?.split("-")[0].toLowerCase()
  return primary === "en" || primary === "pt" ? primary : undefined
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

function videoToItem(
  video: LatestVideo,
  article: Article | undefined,
  details: VideoDetails | undefined,
  isCollab = false
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
    articleUrl: article?.url,
    readingMinutes: article?.reading_time_minutes,
    ...(isCollab ? { isCollab: true } : {})
  }
}

function articleToItem(article: Article, videoId: string | null): ContentItem {
  return {
    id: `article-${article.id}`,
    title: article.title,
    date: article.published_at,
    thumbnailUrl: article.cover_image || article.social_image,
    description: article.description,
    // The post may link a video that's older than the fetched window — still
    // offer "Watch" from the parsed id even though that video has no own card.
    videoUrl: videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : undefined,
    articleUrl: article.url,
    readingMinutes: article.reading_time_minutes
  }
}

function isShort(details: VideoDetails | undefined): boolean {
  const duration = details?.durationSeconds
  return duration !== undefined && duration <= SHORTS_MAX_SECONDS
}

// Merge YouTube uploads, Studio-collab guest videos, and dev.to posts into one
// deduped, newest-first feed. Pairing is automatic for own uploads: a post's
// body links its video, and a video's description links its post — no manual
// mapping. Shorts and course-playlist videos are excluded. Collabs are marked
// with isCollab (guest appearances on other channels). Pure (no I/O) so it
// can be unit-tested with fixtures.
export function buildContentFeed(
  videos: LatestVideo[],
  articles: Article[],
  courseVideoIds: Set<string>,
  details: Map<string, VideoDetails>,
  collabVideos: LatestVideo[] = []
): ContentItem[] {
  const articleByVideoId = new Map<string, Article>()
  const articleBySlug = new Map<string, Article>()
  for (const article of articles) {
    articleBySlug.set(article.slug, article)
    const videoId = videoIdFromBody(article.body_markdown ?? "")
    if (videoId) articleByVideoId.set(videoId, article)
  }

  const collabIds = new Set(
    collabVideos
      .filter((video) => isOnOrAfterCollabStart(video.snippet.publishedAt))
      .map((video) => video.snippet.resourceId.videoId)
  )

  const usedArticleIds = new Set<number>()
  const seenVideoIds = new Set<string>()
  const items: ContentItem[] = []

  for (const video of videos) {
    const videoId = video.snippet.resourceId.videoId

    // Drop course videos (they have their own page) and Shorts (by duration —
    // keep anything whose duration is unknown rather than guess).
    if (courseVideoIds.has(videoId)) continue
    const videoDetails = details.get(videoId)
    if (isShort(videoDetails)) continue

    let article = articleByVideoId.get(videoId)
    if (!article) {
      const slug = articleSlugFromDescription(video.snippet.description ?? "")
      if (slug) article = articleBySlug.get(slug)
    }
    if (article) usedArticleIds.add(article.id)
    seenVideoIds.add(videoId)
    items.push(
      videoToItem(video, article, videoDetails, collabIds.has(videoId))
    )
  }

  // Guest appearances on other channels (Studio collaborator). Skip Shorts,
  // pre-cutoff publishes, and IDs already present from own uploads.
  for (const video of collabVideos) {
    const videoId = video.snippet.resourceId.videoId
    if (seenVideoIds.has(videoId)) continue
    if (!isOnOrAfterCollabStart(video.snippet.publishedAt)) continue
    const videoDetails = details.get(videoId)
    if (isShort(videoDetails)) continue
    seenVideoIds.add(videoId)
    items.push(videoToItem(video, undefined, videoDetails, true))
  }

  // Posts with no matching video card become their own cards (still linking a
  // video if the body references one outside the fetched window).
  for (const article of articles) {
    if (!usedArticleIds.has(article.id)) {
      items.push(
        articleToItem(article, videoIdFromBody(article.body_markdown ?? ""))
      )
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return items
}
