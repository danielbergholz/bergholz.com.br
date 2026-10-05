import { getArticles, getPublishedArticles } from "@/data-access/blog"
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
  discoverableArticles,
  withChannelLanguage
} from "@/lib/feed"
import type { ContentItem, PublishedArticle } from "@/lib/types"

// All article routes share one batched lookup, including videos that are still
// private or too old for the recent uploads window. No owner OAuth is needed.
export const getArticleVideoDetails = async () => {
  const articles = await getPublishedArticles()
  return getVideoDetails([...new Set(articleVideoIds(articles).values())])
}

export const getDiscoverableArticles = async (): Promise<
  PublishedArticle[]
> => {
  const [articles, details] = await Promise.all([
    getPublishedArticles(),
    getArticleVideoDetails()
  ])
  return discoverableArticles(articles, details)
}

// Fetches everything the merged feed needs, then hands off to the pure
// buildContentFeed (which does the pairing/filtering/sorting and is unit-tested).
// Only feed summaries are returned, so article bodies don't reach the client.
// Thumbnail of the video each post links, keyed by post id, for the /blog
// listing: prefer the video thumbnail to the article cover. Local posts are
// compiled once per build; YouTube publication state refreshes independently.
export const getArticleVideoThumbnails = async (): Promise<
  Map<number | string, string>
> => {
  const articles = await getArticles()
  const details = await getArticleVideoDetails()
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
    ...new Set([
      ...[...videos, ...videosBr].map(
        (video) => video.snippet.resourceId.videoId
      ),
      ...articleVideoIds(articles).values()
    ])
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
