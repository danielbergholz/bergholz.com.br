import { blogArticlePath } from "./blog.ts"
import { siteLanguage } from "./i18n.ts"
import type {
  Article,
  ContentItem,
  LatestVideo,
  PublishedArticle,
  VideoDetails
} from "./types.ts"

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

// The authenticated list has the post bodies but no `language`/`social_image`;
// the public list has those but no bodies. Merge the public metadata in by id
// so the feed can link posts to their page on this site. Pure — returns new
// objects, never mutates the input.
export function withPublishedMetadata(
  articles: Article[],
  published: PublishedArticle[]
): Article[] {
  const byId = new Map(published.map((article) => [article.id, article]))
  return articles.map((article) => {
    const meta = byId.get(article.id)
    if (!meta) return article
    return {
      ...article,
      language: siteLanguage(meta.language),
      social_image: meta.social_image || article.social_image
    }
  })
}

// Where "Read" goes: the post's page on this site when we know which locale
// it belongs to, else its dev.to URL (a post not yet in the public list).
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

// Merge YouTube uploads and dev.to posts into one deduped, newest-first feed.
// Pairing is automatic: a post's body links its video, and a video's
// description links its post — no manual mapping. Shorts and course-playlist
// videos are excluded, except ids in shortsExemptIds (channels that post no
// Shorts, where short uploads are real videos). Pure (no I/O) so it can be
// unit-tested with fixtures.
export function buildContentFeed(
  videos: LatestVideo[],
  articles: Article[],
  courseVideoIds: Set<string>,
  details: Map<string, VideoDetails>,
  shortsExemptIds: Set<string> = new Set()
): ContentItem[] {
  const articleByVideoId = new Map<string, Article>()
  const articleBySlug = new Map<string, Article>()
  for (const article of articles) {
    articleBySlug.set(article.slug, article)
    const videoId = videoIdFromBody(article.body_markdown ?? "")
    if (videoId) articleByVideoId.set(videoId, article)
  }

  const usedArticleIds = new Set<number>()
  const items: ContentItem[] = []

  for (const video of videos) {
    const videoId = video.snippet.resourceId.videoId

    // Drop course videos (they have their own page) and Shorts (by duration —
    // keep anything whose duration is unknown rather than guess).
    if (courseVideoIds.has(videoId)) continue
    const videoDetails = details.get(videoId)
    if (!shortsExemptIds.has(videoId) && isShort(videoDetails)) continue

    let article = articleByVideoId.get(videoId)
    if (!article) {
      const slug = articleSlugFromDescription(video.snippet.description ?? "")
      if (slug) article = articleBySlug.get(slug)
    }
    if (article) usedArticleIds.add(article.id)
    items.push(videoToItem(video, article, videoDetails))
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
