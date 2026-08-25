import { getArticles } from "@/data-access/blog"
import {
  getCollabVideos,
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
  const [videos, videosBr, articles, courseVideoIds, collabVideos] =
    await Promise.all([
      getLatestVideos(50),
      getLatestVideosBr(50),
      getArticles(),
      getCourseVideoIds(),
      getCollabVideos()
    ])

  const details = await getVideoDetails([
    ...new Set(
      [...videos, ...videosBr, ...collabVideos].map(
        (video) => video.snippet.resourceId.videoId
      )
    )
  ])

  // Channel-level language fallback: uploads that don't declare a language on
  // YouTube inherit their channel's (main → en, BR → pt-BR), so the language
  // badge on cards stays reliable. Collabs are left as reported.
  const detailsWithLanguage = withChannelLanguage(
    withChannelLanguage(details, videos, "en"),
    videosBr,
    "pt-BR"
  )

  return buildContentFeed(
    [...videos, ...videosBr],
    articles,
    courseVideoIds,
    detailsWithLanguage,
    collabVideos
  )
}
