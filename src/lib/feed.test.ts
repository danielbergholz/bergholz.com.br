import assert from "node:assert/strict"
import { test } from "node:test"
import {
  articleSlugFromDescription,
  buildContentFeed,
  firstMeaningfulLine,
  siteLanguage,
  videoIdFromBody,
  withChannelLanguage
} from "./feed.ts"
import type { Article, LatestVideo, VideoDetails } from "./types"

// --- fixtures ---
const thumb = (url: string) => ({ url, width: 1280, height: 720 })

function video(opts: {
  id: string
  title?: string
  date?: string
  description?: string
}): LatestVideo {
  return {
    snippet: {
      publishedAt: opts.date ?? "2025-01-01T00:00:00Z",
      title: opts.title ?? `Video ${opts.id}`,
      description: opts.description ?? "",
      thumbnails: {
        default: thumb("d"),
        medium: thumb(`med-${opts.id}`),
        high: thumb("h")
      },
      resourceId: { videoId: opts.id }
    }
  }
}

function article(opts: {
  id: number
  slug: string
  title?: string
  date?: string
  description?: string
  body?: string
  minutes?: number
}): Article {
  return {
    id: opts.id,
    title: opts.title ?? `Article ${opts.id}`,
    slug: opts.slug,
    description: opts.description ?? `desc ${opts.id}`,
    published_at: opts.date ?? "2025-01-01T00:00:00Z",
    url: `https://dev.to/danielbergholz/${opts.slug}`,
    cover_image: `cover-${opts.id}`,
    social_image: `social-${opts.id}`,
    reading_time_minutes: opts.minutes ?? 5,
    tag_list: [],
    body_markdown: opts.body ?? ""
  }
}

const noCourses = new Set<string>()
const details = (entries: [string, VideoDetails][]) => new Map(entries)
const durations = (entries: [string, number][]) =>
  details(entries.map(([id, s]) => [id, { durationSeconds: s }]))

// --- helpers ---
test("videoIdFromBody handles every link format", () => {
  assert.equal(
    videoIdFromBody("watch https://www.youtube.com/watch?v=abcdefghijk now"),
    "abcdefghijk"
  )
  assert.equal(videoIdFromBody("https://youtu.be/abcdefghijk"), "abcdefghijk")
  assert.equal(videoIdFromBody("{% youtube abcdefghijk %}"), "abcdefghijk")
  assert.equal(
    videoIdFromBody("{% embed https://youtu.be/abcdefghijk %}"),
    "abcdefghijk"
  )
  assert.equal(videoIdFromBody("no video here"), null)
})

test("articleSlugFromDescription extracts the dev.to slug", () => {
  assert.equal(
    articleSlugFromDescription(
      "read more: https://dev.to/danielbergholz/my-post"
    ),
    "my-post"
  )
  assert.equal(articleSlugFromDescription("nothing to see"), null)
})

test("firstMeaningfulLine skips promo lines", () => {
  assert.equal(
    firstMeaningfulLine(
      "Check my website: https://x\nThis is the real summary line, plenty long."
    ),
    "This is the real summary line, plenty long."
  )
  assert.equal(
    firstMeaningfulLine("Check my website: https://x\nShort"),
    undefined
  )
  assert.equal(firstMeaningfulLine(""), undefined)
})

test("siteLanguage collapses BCP-47 tags to the site's languages", () => {
  assert.equal(siteLanguage("en"), "en")
  assert.equal(siteLanguage("en-US"), "en")
  assert.equal(siteLanguage("pt-BR"), "pt")
  assert.equal(siteLanguage("pt-PT"), "pt")
  assert.equal(siteLanguage("es"), undefined)
  assert.equal(siteLanguage(undefined), undefined)
})

test("withChannelLanguage fills missing languages but keeps declared ones", () => {
  const declared = video({ id: "declared001" })
  const missing = video({ id: "missing0001" })
  const absent = video({ id: "absent00001" })
  const input = details([
    ["declared001", { durationSeconds: 600, language: "en" }],
    ["missing0001", { durationSeconds: 600 }]
  ])

  const result = withChannelLanguage(
    input,
    [declared, missing, absent],
    "pt-BR"
  )

  assert.equal(result.get("declared001")?.language, "en")
  assert.equal(result.get("missing0001")?.language, "pt-BR")
  assert.equal(
    result.get("missing0001")?.durationSeconds,
    600,
    "keeps the other details"
  )
  assert.equal(result.get("absent00001")?.language, "pt-BR")
  assert.equal(
    input.get("missing0001")?.language,
    undefined,
    "input map is not mutated"
  )
})

// --- buildContentFeed ---
test("pairs a video with its article via the body video id", () => {
  const v = video({ id: "vid1111aaaa", description: "Check my website: x" })
  const a = article({
    id: 1,
    slug: "post-one",
    body: "intro https://youtu.be/vid1111aaaa outro",
    description: "clean excerpt"
  })
  const feed = buildContentFeed(
    [v],
    [a],
    noCourses,
    durations([["vid1111aaaa", 600]])
  )

  assert.equal(feed.length, 1, "paired article is not duplicated")
  assert.equal(feed[0].videoUrl, "https://www.youtube.com/watch?v=vid1111aaaa")
  assert.equal(feed[0].articleUrl, "https://dev.to/danielbergholz/post-one")
  assert.equal(feed[0].readingMinutes, 5)
  assert.equal(feed[0].durationSeconds, 600)
  assert.equal(
    feed[0].description,
    "clean excerpt",
    "prefers the article excerpt"
  )
})

test("pairs via the slug in the video description when the body has no id", () => {
  const v = video({
    id: "vid2222bbbb",
    description: "Full write-up: https://dev.to/danielbergholz/post-two"
  })
  const a = article({ id: 2, slug: "post-two", body: "" })
  const feed = buildContentFeed(
    [v],
    [a],
    noCourses,
    durations([["vid2222bbbb", 600]])
  )

  assert.equal(feed.length, 1)
  assert.equal(feed[0].articleUrl, "https://dev.to/danielbergholz/post-two")
})

test("excludes Shorts (<= 180s) but keeps 181s and unknown durations", () => {
  const short = video({ id: "short000001" })
  const boundary = video({ id: "boundary001" })
  const real = video({ id: "real0000001" })
  const unknown = video({ id: "unknown0001" })
  const feed = buildContentFeed(
    [short, boundary, real, unknown],
    [],
    noCourses,
    durations([
      ["short000001", 180],
      ["boundary001", 181],
      ["real0000001", 600]
    ])
  )
  const ids = feed.map((i) => i.id)
  assert.deepEqual(
    ids.sort(),
    ["boundary001", "real0000001", "unknown0001"].sort()
  )
})

test("excludes course-playlist videos", () => {
  const v = video({ id: "course00001" })
  const feed = buildContentFeed(
    [v],
    [],
    new Set(["course00001"]),
    durations([["course00001", 600]])
  )
  assert.equal(feed.length, 0)
})

test("a video with no article is watch-only", () => {
  const v = video({ id: "solo0000001", description: "Check my website: x" })
  const feed = buildContentFeed(
    [v],
    [],
    noCourses,
    durations([["solo0000001", 600]])
  )

  assert.equal(feed.length, 1)
  assert.equal(feed[0].videoUrl, "https://www.youtube.com/watch?v=solo0000001")
  assert.equal(feed[0].articleUrl, undefined)
  assert.equal(feed[0].readingMinutes, undefined)
  assert.equal(
    feed[0].description,
    undefined,
    "promo-only description is dropped"
  )
})

test("a text-only article becomes its own card", () => {
  const a = article({ id: 9, slug: "essay", body: "no video linked here" })
  const feed = buildContentFeed([], [a], noCourses, new Map())

  assert.equal(feed.length, 1)
  assert.equal(feed[0].id, "article-9")
  assert.equal(feed[0].articleUrl, "https://dev.to/danielbergholz/essay")
  assert.equal(feed[0].videoUrl, undefined)
})

test("an article linking an out-of-window video still offers Watch", () => {
  const a = article({
    id: 10,
    slug: "old",
    body: "https://youtu.be/oldvideo111"
  })
  const feed = buildContentFeed([], [a], noCourses, new Map())

  assert.equal(feed.length, 1)
  assert.equal(feed[0].videoUrl, "https://www.youtube.com/watch?v=oldvideo111")
  assert.equal(feed[0].articleUrl, "https://dev.to/danielbergholz/old")
})

test("video language flows into the item; article-only cards have none", () => {
  const pt = video({ id: "ptvideo0001" })
  const unset = video({ id: "unsetvid001" })
  const a = article({ id: 11, slug: "text-only", body: "" })
  const feed = buildContentFeed(
    [pt, unset],
    [a],
    noCourses,
    details([
      ["ptvideo0001", { durationSeconds: 600, language: "pt-BR" }],
      ["unsetvid001", { durationSeconds: 600 }]
    ])
  )

  const byId = new Map(feed.map((i) => [i.id, i]))
  assert.equal(byId.get("ptvideo0001")?.language, "pt")
  assert.equal(byId.get("unsetvid001")?.language, undefined)
  assert.equal(byId.get("article-11")?.language, undefined)
})

test("sorts newest first across videos and articles", () => {
  const oldVideo = video({ id: "oldvid00001", date: "2025-01-01T00:00:00Z" })
  const newArticle = article({
    id: 3,
    slug: "fresh",
    date: "2025-06-01T00:00:00Z"
  })
  const feed = buildContentFeed(
    [oldVideo],
    [newArticle],
    noCourses,
    durations([["oldvid00001", 600]])
  )
  assert.deepEqual(
    feed.map((i) => i.id),
    ["article-3", "oldvid00001"]
  )
})

test("shortsExemptIds keeps short videos that would otherwise be dropped", () => {
  const exemptShort = video({ id: "brwelcome01" })
  const normalShort = video({ id: "realshort01" })
  const feed = buildContentFeed(
    [exemptShort, normalShort],
    [],
    noCourses,
    durations([
      ["brwelcome01", 122],
      ["realshort01", 60]
    ]),
    new Set(["brwelcome01"])
  )

  assert.deepEqual(
    feed.map((i) => i.id),
    ["brwelcome01"]
  )
})
