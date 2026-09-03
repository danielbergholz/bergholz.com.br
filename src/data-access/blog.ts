import type {
  Article,
  PublishedArticle,
  PublishedArticleWithBody
} from "@/lib/types"

const BASE_URL = "https://dev.to/api"
const USERNAME = "danielbergholz"
const API_KEY = process.env.DEV_TO_API_KEY

// Every dev.to fetch is cached in the Data Cache for an hour and tagged, so:
// - the listing is fetched once per hour no matter how many routes use it
//   (home, /videos, /blog, every /blog/[slug], the sitemap and the RSS feed
//   all share the same cache entry);
// - POST /api/revalidate can expire everything at once with revalidateTag.
export const DEVTO_CACHE_TAG = "devto"

const cacheOptions = { next: { revalidate: 3600, tags: [DEVTO_CACHE_TAG] } }

// The Forem API asks for an explicit version header and an identifiable UA.
const HEADERS = {
  Accept: "application/vnd.forem.api-v1+json",
  "User-Agent": "bergholz.com.br (+https://bergholz.com.br)"
}

// dev.to publishes no rate limit but does return 429 under a burst (seen when
// a build prerendered every post at once). Retry those a couple of times with
// a growing pause (honouring Retry-After when present) instead of failing
// the whole build/revalidation on a transient throttle.
const RETRY_DELAYS_MS = [2000, 5000]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function devtoFetch(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  const init = { headers: { ...HEADERS, ...extraHeaders }, ...cacheOptions }
  let response = await fetch(url, init)
  for (const delay of RETRY_DELAYS_MS) {
    if (response.status !== 429) break
    const retryAfter = Number(response.headers.get("retry-after"))
    await sleep(retryAfter > 0 ? retryAfter * 1000 : delay)
    // Next memoizes identical fetches within a render pass and would hand
    // back the same 429; a fresh AbortSignal opts the retry out of that
    // (the first attempt stays memoized so generateMetadata and the page
    // share it).
    response = await fetch(url, {
      ...init,
      signal: new AbortController().signal
    })
  }
  return response
}

// Throw on any bad response so ISR keeps serving the last healthy page.
// The "keep last good version" fallback only triggers on a thrown error —
// a parseable-but-wrong body (e.g. a 429/401 error object) would otherwise
// be cached as healthy and break the render.
async function devtoFetchList<T>(
  url: string,
  what: string,
  extraHeaders?: Record<string, string>
): Promise<T[]> {
  const response = await devtoFetch(url, extraHeaders)
  if (!response.ok) {
    throw new Error(`dev.to API error (${what}): ${response.status}`)
  }
  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error(`dev.to API (${what}): expected an array of articles`)
  }
  return data as T[]
}

// Authenticated list: the only endpoint that returns `body_markdown` for every
// post in one call (needed to pair posts with their videos in the feed).
// per_page=1000 so the merged feed sees every post (the default is only 30).
export const getArticles = (): Promise<Article[]> =>
  devtoFetchList<Article>(
    `${BASE_URL}/articles/me/published?per_page=1000`,
    "me/published",
    { "api-key": API_KEY ?? "" }
  )

// Public list (no API key): every published post with `language` and
// `social_image` but no body. Paginates only if a page comes back full, so
// it stays a single request until there are more than PER_PAGE posts.
const PER_PAGE = 100

export const getPublishedArticles = async (): Promise<PublishedArticle[]> => {
  const articles: PublishedArticle[] = []
  for (let page = 1; ; page++) {
    const batch = await devtoFetchList<PublishedArticle>(
      `${BASE_URL}/articles?username=${USERNAME}&per_page=${PER_PAGE}&page=${page}`,
      "articles list"
    )
    articles.push(...batch)
    if (batch.length < PER_PAGE) break
  }
  return articles
}

// Single post with its rendered `body_html`. Resolves to null on 404 (the
// caller turns that into a real 404 page); any other failure throws so a
// previously cached version of the page is kept.
export const getArticle = async (
  slug: string
): Promise<PublishedArticleWithBody | null> => {
  const response = await devtoFetch(
    `${BASE_URL}/articles/${USERNAME}/${encodeURIComponent(slug)}`
  )
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`dev.to API error (article ${slug}): ${response.status}`)
  }
  const data = await response.json()
  if (typeof data?.body_html !== "string") {
    throw new Error(`dev.to API: article ${slug} has no body_html`)
  }
  return data as PublishedArticleWithBody
}
