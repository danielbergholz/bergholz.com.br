import { getArticles } from "@/data-access/blog"
import {
  getCourseVideoIds,
  getLatestVideos,
  getLatestVideosBr,
  getVideoDetails
} from "@/data-access/youtube"
import { buildContentFeed, withChannelLanguage } from "@/lib/feed"
import type { ContentItem } from "@/lib/types"

// Fetches everything the merged feed needs, then hands off to the pure
// buildContentFeed (which does the pairing/filtering/sorting and is unit-tested).
// `body_markdown` is consumed in there and never returned, so the large article
// bodies don't reach the client.
export const getContentFeed = async (): Promise<ContentItem[]> => {
  const [videos, videosBr, articles, courseVideoIds] = await Promise.all([
    getLatestVideos(50),
    getLatestVideosBr(50),
    getArticles(),
    getCourseVideoIds()
  ])

  const details = await getVideoDetails([
    ...new Set(
      [...videos, ...videosBr].map((video) => video.snippet.resourceId.videoId)
    )
  ])

  // Channel-level language fallback: uploads that don't declare a language on
  // YouTube inherit their channel's (main → en, BR → pt-BR), so the language
  // badge on cards stays reliable.
  const detailsWithLanguage = withChannelLanguage(
    withChannelLanguage(details, videos, "en"),
    videosBr,
    "pt-BR"
  )

  // The BR channel posts no Shorts, so its short uploads are real videos —
  // exempt them from the duration-based Shorts filter.
  const brVideoIds = new Set(
    videosBr.map((video) => video.snippet.resourceId.videoId)
  )

  return buildContentFeed(
    [...videos, ...videosBr],
    articles,
    courseVideoIds,
    detailsWithLanguage,
    brVideoIds
  )
}
