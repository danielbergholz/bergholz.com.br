import type {
  ChannelStats,
  LatestVideo,
  LatestVideos,
  Playlists,
  VideoDetails
} from "@/lib/types"
import {
  isAcceptedCollaborator,
  isOnOrAfterCollabStart
} from "@/lib/youtube-collabs"
import { parseIsoDuration } from "@/lib/utils"

const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID
// Second channel, with Brazilian Portuguese content. Optional: without it the
// feed and stats simply cover only the main channel.
const CHANNEL_ID_BR = process.env.YOUTUBE_CHANNEL_ID_BR
const BASE_URL = "https://www.googleapis.com/youtube/v3"
const PLAYLISTS_URL = `${BASE_URL}/playlists?part=snippet,contentDetails&maxResults=50&key=${API_KEY}&channelId=${CHANNEL_ID}`
// The channels endpoint accepts a comma-separated id list, so both channels'
// stats come back from a single call.
const STATS_CHANNEL_IDS = [CHANNEL_ID, CHANNEL_ID_BR].filter(Boolean).join(",")
const CHANNEL_URL = `${BASE_URL}/channels?part=statistics&id=${STATS_CHANNEL_IDS}&key=${API_KEY}`

// Every channel's auto-generated "uploads" playlist shares the channel id with
// the `UC` prefix swapped for `UU` — so we can list recent uploads with a single
// playlistItems call (1 quota unit) instead of an extra channels lookup.
const UPLOADS_PLAYLIST_ID = CHANNEL_ID?.replace(/^UC/, "UU")
const UPLOADS_PLAYLIST_ID_BR = CHANNEL_ID_BR?.replace(/^UC/, "UU")

const getPlaylists = async () => {
  const response = await fetch(PLAYLISTS_URL)

  // Throw on any bad response so ISR keeps serving the last healthy page.
  // YouTube returns 403 on quota exhaustion with a parseable error body that
  // lacks `items`; without these guards that surfaces as a cryptic crash and
  // an empty `items` array would silently cache an empty courses page.
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data: Playlists = await response.json()
  if (!Array.isArray(data.items)) {
    throw new Error("YouTube API: missing playlist items")
  }

  return data.items
}

// Combined totals across every configured channel (main + BR).
export const getChannelStats = async () => {
  const response = await fetch(CHANNEL_URL, { next: { revalidate: 86400 } })
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data: ChannelStats = await response.json()
  if (!data.items?.length) {
    throw new Error("YouTube API: missing channel statistics")
  }

  return data.items.reduce(
    (totals, item) => ({
      subscriberCount:
        totals.subscriberCount + Number(item.statistics.subscriberCount),
      viewCount: totals.viewCount + Number(item.statistics.viewCount)
    }),
    { subscriberCount: 0, viewCount: 0 }
  )
}

const getUploads = async (
  playlistId: string | undefined,
  maxResults: number,
  { emptyOn404 = false } = {}
): Promise<LatestVideo[]> => {
  const url = `${BASE_URL}/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${API_KEY}`
  const response = await fetch(url, { next: { revalidate: 3600 } })

  // A channel's auto-generated uploads playlist 404s until its first video is
  // published; for channels where that's expected (brand-new BR channel),
  // treat it as "no uploads yet" instead of an error.
  if (response.status === 404 && emptyOn404) {
    return []
  }

  // Same guards as the other calls: throw on any bad response so ISR keeps
  // serving the last healthy page instead of caching an empty/broken video list.
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`)
  }

  const data: LatestVideos = await response.json()
  if (!Array.isArray(data.items)) {
    throw new Error("YouTube API: missing playlist items")
  }

  return data.items
}

export const getLatestVideos = async (maxResults = 6) =>
  getUploads(UPLOADS_PLAYLIST_ID, maxResults)

// Uploads from the BR channel; [] when YOUTUBE_CHANNEL_ID_BR isn't set (do
// not fail the page).
export const getLatestVideosBr = async (
  maxResults = 6
): Promise<LatestVideo[]> =>
  UPLOADS_PLAYLIST_ID_BR
    ? getUploads(UPLOADS_PLAYLIST_ID_BR, maxResults, { emptyOn404: true })
    : []

export const getCourses = async () => {
  const playlists = await getPlaylists()
  const englishCourses = playlists.filter((playlist) =>
    playlist.snippet.title.toLowerCase().includes("course")
  )
  const portugueseCourses = playlists.filter((playlist) =>
    playlist.snippet.title.toLowerCase().includes("curso")
  )

  return { englishCourses, portugueseCourses }
}

// Host channel whose uploads we scan for Studio collabs that include this
// channel. Defaults to Dashbit; override with YOUTUBE_COLLAB_CHANNEL_ID.
const COLLAB_HOST_CHANNEL_ID =
  process.env.YOUTUBE_COLLAB_CHANNEL_ID ?? "UCN75P76wkH3V_CDWCKpM-pQ"
const COLLAB_HOST_UPLOADS_PLAYLIST_ID = COLLAB_HOST_CHANNEL_ID.replace(
  /^UC/,
  "UU"
)
const COLLAB_CANDIDATE_COUNT = 30

const INNERTUBE_CLIENT = {
  clientName: "WEB",
  clientVersion: "2.20260101.00.00",
  hl: "en",
  gl: "US"
}

// InnerTube watch-next payload — the only place Studio collaborators appear.
// Undocumented; on failure return null so one bad video does not break the feed.
const fetchWatchNext = async (videoId: string): Promise<unknown | null> => {
  try {
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/next?prettyPrint=false",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          context: { client: INNERTUBE_CLIENT },
          videoId
        }),
        next: { revalidate: 86400 }
      }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

const getHostUploads = async (maxResults: number): Promise<LatestVideo[]> =>
  getUploads(COLLAB_HOST_UPLOADS_PLAYLIST_ID, maxResults)

// Guest appearances on a host channel (Dashbit by default): recent uploads
// where this channel is an accepted YouTube Studio collaborator. The Data API
// has no collaborator field, so each candidate is checked via InnerTube.
// Only videos on/after COLLAB_START (2026-08-03) are considered — older host
// uploads can falsely list this channel as a collaborator.
// Missing CHANNEL_ID → [] (do not fail the page).
export const getCollabVideos = async (): Promise<LatestVideo[]> => {
  if (!CHANNEL_ID) return []

  const candidates = (await getHostUploads(COLLAB_CANDIDATE_COUNT)).filter(
    (video) => isOnOrAfterCollabStart(video.snippet.publishedAt)
  )

  const checks = await Promise.all(
    candidates.map(async (video) => {
      const videoId = video.snippet.resourceId.videoId
      const payload = await fetchWatchNext(videoId)
      if (!payload || !isAcceptedCollaborator(payload, CHANNEL_ID)) {
        return null
      }
      return video
    })
  )

  return checks.filter((video): video is LatestVideo => video !== null)
}

type VideoDetailsResponse = {
  items?: {
    id: string
    contentDetails?: { duration?: string }
    snippet?: { defaultAudioLanguage?: string; defaultLanguage?: string }
  }[]
}

type PlaylistVideoIdResponse = {
  items?: { contentDetails?: { videoId?: string } }[]
  nextPageToken?: string
}

// Durations and language live on the videos endpoint, not playlistItems.
// Durations show video length and detect Shorts (which the API has no flag
// for); language drives the card badge. Batched 50 ids per call — extra
// `part`s cost no additional quota. Neither changes after upload, so cache
// for a day.
export const getVideoDetails = async (videoIds: string[]) => {
  const details = new Map<string, VideoDetails>()
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const url = `${BASE_URL}/videos?part=contentDetails,snippet&id=${batch.join(",")}&key=${API_KEY}`
    const response = await fetch(url, { next: { revalidate: 86400 } })
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: VideoDetailsResponse = await response.json()
    if (!Array.isArray(data.items)) {
      throw new Error("YouTube API: missing video items")
    }

    for (const item of data.items) {
      const duration = item.contentDetails?.duration
      details.set(item.id, {
        durationSeconds: duration ? parseIsoDuration(duration) : undefined,
        language:
          item.snippet?.defaultAudioLanguage ?? item.snippet?.defaultLanguage
      })
    }
  }
  return details
}

const getPlaylistVideoIds = async (playlistId: string): Promise<string[]> => {
  const ids: string[] = []
  let pageToken = ""
  do {
    const url = `${BASE_URL}/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`
    const response = await fetch(url, { next: { revalidate: 86400 } })
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: PlaylistVideoIdResponse = await response.json()
    for (const item of data.items ?? []) {
      if (item.contentDetails?.videoId) ids.push(item.contentDetails.videoId)
    }
    pageToken = data.nextPageToken ?? ""
  } while (pageToken)
  return ids
}

// Every video id that belongs to a course playlist, so the merged feed can
// exclude course content (it has its own page). Course memberships rarely
// change, so cache for a day.
export const getCourseVideoIds = async (): Promise<Set<string>> => {
  const { englishCourses, portugueseCourses } = await getCourses()
  const playlists = [...englishCourses, ...portugueseCourses]
  const idLists = await Promise.all(
    playlists.map((playlist) => getPlaylistVideoIds(playlist.id))
  )
  return new Set(idLists.flat())
}
