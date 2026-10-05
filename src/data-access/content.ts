import { getArticles } from "@/data-access/blog"
import {
  getCourseVideoIds,
  getLatestVideos,
  getLatestVideosBr,
  getVideoDetails
} from "@/data-access/youtube"
import {
  articleVideoIds,
  articleVideoThumbnails,
  buildContentFeed,
  withChannelLanguage
} from "@/lib/feed"
import type { ContentItem } from "@/lib/types"

// Fetches everything the merged feed needs, then hands off to the pure
// buildContentFeed (which does the pairing/filtering/sorting and is unit-tested).
// Only feed summaries are returned, so article bodies don't reach the client.
// Thumbnail of the video each post links, keyed by post id, for the /blog
// listing: prefer the video thumbnail to the article cover. Local posts are
// compiled once per build; YouTube details retain their existing daily cache.
export const getArticleVideoThumbnails = async (): Promise<
  Map<number | string, string>
> => {
  const articles = await getArticles()
  const videoIds = [...new Set(articleVideoIds(articles).values())]
  const details = await getVideoDetails(videoIds)
  return articleVideoThumbnails(articles, details)
}

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

  return buildContentFeed(
    [...videos, ...videosBr],
    articles,
    courseVideoIds,
    detailsWithLanguage
  )
}
