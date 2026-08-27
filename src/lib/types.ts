export type Article = {
  id: number
  title: string
  slug: string
  description: string
  published_at: string
  url: string
  cover_image: string
  social_image: string
  reading_time_minutes: number
  tag_list: string[]
  // The dev.to list endpoint (/articles/me/published) returns the full markdown,
  // which holds the YouTube link Daniel pastes in each post. We parse the video
  // id from it server-side and never ship this field to the client.
  body_markdown: string
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
