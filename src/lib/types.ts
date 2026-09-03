import type { Locale } from "./i18n.ts"

// A post from the authenticated dev.to list (/articles/me/published). It's the
// only endpoint that returns `body_markdown` for every post in one call —
// that's where the YouTube link Daniel pastes in each post comes from, parsed
// server-side and never shipped to the client. It does NOT return `language`
// or `social_image`; those are merged in from the public list (see
// withPublishedMetadata in feed.ts).
export type Article = {
  id: number
  title: string
  slug: string
  description: string
  published_at: string
  url: string
  cover_image: string | null
  social_image?: string
  reading_time_minutes: number
  tag_list: string[]
  body_markdown: string
  // Collapsed from the public list's `language` ("en" | "pt" for this
  // account); unset when the post isn't in the public list yet.
  language?: Locale
}

// A post from the public dev.to list (/articles?username=…). Same post, but
// with `language` and `social_image`, and no body. Powers /blog.
export type PublishedArticle = {
  id: number
  title: string
  slug: string
  description: string
  published_at: string
  edited_at: string | null
  url: string
  canonical_url: string
  cover_image: string | null
  social_image: string
  reading_time_minutes: number
  tag_list: string[]
  // BCP-47-ish primary tag as dev.to reports it ("en", "pt").
  language: string
}

// A single post from /articles/{username}/{slug}: the public shape plus the
// rendered body. Note that on this endpoint dev.to swaps `tag_list` to a
// comma-separated string, so tags are always read from the list instead.
export type PublishedArticleWithBody = Omit<PublishedArticle, "tag_list"> & {
  body_html: string
}

// Unified shape for the merged content feed: a topic that may exist as a video,
// an article, or both. Built by getContentFeed from videos + articles.
export type ContentItem = {
  id: string
  title: string
  date: string
  thumbnailUrl: string
  description?: string
  durationSeconds?: number
  // Spoken language of the video (from YouTube metadata); absent for
  // article-only items and videos whose language isn't set.
  language?: "en" | "pt"
  videoUrl?: string
  articleUrl?: string
  readingMinutes?: number
}

// Per-video metadata from the videos endpoint, keyed by video id.
// `language` is the raw BCP-47 tag YouTube reports (e.g. "en", "pt-BR").
export type VideoDetails = {
  durationSeconds?: number
  language?: string
}

export type ChannelStats = {
  items: {
    statistics: {
      viewCount: string
      subscriberCount: string
    }
  }[]
}

export type Playlists = {
  items: Video[]
}

export type Video = {
  id: string
  snippet: Snippet
  contentDetails: ContentDetails
}

type ContentDetails = {
  itemCount: number
}

type Snippet = {
  publishedAt: string
  title: string
  description: string
  thumbnails: Thumbnails
}

type Thumbnails = {
  default: Thumbnail
  standard: Thumbnail
  medium: Thumbnail
  high: Thumbnail
  maxres: Thumbnail
}

type Thumbnail = {
  url: string
  width: number
  height: number
}

// A single video from the channel's uploads playlist (playlistItems endpoint).
// This shape differs from the playlist `Video` type above: the video id lives in
// `snippet.resourceId.videoId`, and `standard`/`maxres` thumbnails are not always
// generated, so they're optional — fall back to `medium` (always present, 16:9).
export type LatestVideo = {
  snippet: {
    publishedAt: string
    title: string
    description: string
    thumbnails: {
      default: Thumbnail
      medium: Thumbnail
      high: Thumbnail
      standard?: Thumbnail
      maxres?: Thumbnail
    }
    resourceId: {
      videoId: string
    }
  }
}

export type LatestVideos = {
  items: LatestVideo[]
}
