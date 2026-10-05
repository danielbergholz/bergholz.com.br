import type { Element, Root } from "hast"
import elixir from "highlight.js/lib/languages/elixir"
import { common } from "lowlight"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { parse } from "yaml"

import { blogArticlePath } from "./blog.ts"
import { hasLocale, type Locale } from "./i18n.ts"
import type { ImageSize } from "./image-size.ts"
import { site } from "./site.ts"
import type { Article, PublishedArticleWithBody } from "./types.ts"

export type LocalArticle = Article & PublishedArticleWithBody

export function youtubeId(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return undefined
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : [
              "youtube.com",
              "www.youtube.com",
              "www.youtube-nocookie.com"
            ].includes(url.hostname)
          ? url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]{11})/)?.[1]
          : undefined
    return id && /^[\w-]{11}$/.test(id) ? id : undefined
  } catch {
    return undefined
  }
}

function embedFrame(properties: Element["properties"], href: string): Element {
  return {
    type: "element",
    tagName: "figure",
    properties: { className: ["article-embed"] },
    children: [
      { type: "element", tagName: "iframe", properties, children: [] },
      {
        type: "element",
        tagName: "figcaption",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "a",
            properties: { href },
            children: [{ type: "text", value: href }]
          }
        ]
      }
    ]
  }
}

// Transform explicitly marked Markdown links after sanitizing user HTML.
// Only these constructed iframes are allowed; arbitrary raw iframes are removed.
function embeds() {
  return (tree: Root) => {
    function walk(parent: Root | Element) {
      parent.children = parent.children.map((child) => {
        if (child.type !== "element") return child
        const link = child.children[0]
        if (
          child.tagName === "p" &&
          child.children.length === 1 &&
          link?.type === "element" &&
          link.tagName === "a" &&
          link.children.length === 1 &&
          link.children[0]?.type === "text" &&
          link.children[0].value === "embed"
        ) {
          const href = String(link.properties.href ?? "")
          const id = youtubeId(href)
          if (id) {
            return embedFrame(
              {
                src: `https://www.youtube-nocookie.com/embed/${id}`,
                title: "YouTube video",
                loading: "lazy",
                allow:
                  "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen",
                referrerPolicy: "strict-origin-when-cross-origin"
              },
              href
            )
          }
          const tweet = href.match(
            /^https:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[\w]+\/status\/(\d+)(?:[/?#]|$)/
          )
          // X's own widgets.js turns this into a sized iframe on the article
          // page (a bare Tweet.html iframe never reports its height); without
          // the script it stays a quoted link to the post.
          if (tweet) {
            return {
              type: "element",
              tagName: "blockquote",
              properties: { className: ["twitter-tweet"], dataDnt: "true" },
              children: [
                {
                  type: "element",
                  tagName: "a",
                  properties: { href },
                  children: [{ type: "text", value: href }]
                }
              ]
            }
          }
          // Other references remain ordinary links, including imported article embeds.
          link.children = [{ type: "text", value: href }]
        }
        walk(child)
        return child
      })
    }
    walk(tree)
  }
}

// Local images get their intrinsic size (no layout shift) when the caller can
// read it; every image loads lazily, since none sits above the article fold.
type RenderOptions = { imageSize?: (src: string) => ImageSize | undefined }

function images() {
  return (tree: Root, file: { data: object }) => {
    const { imageSize } = file.data as RenderOptions
    function walk(parent: Root | Element) {
      for (const child of parent.children) {
        if (child.type !== "element") continue
        if (child.tagName === "img") {
          child.properties.loading = "lazy"
          child.properties.decoding = "async"
          const src = String(child.properties.src ?? "")
          const size = src.startsWith("/blog/") ? imageSize?.(src) : undefined
          if (size) Object.assign(child.properties, size)
        }
        walk(child)
      }
    }
    walk(tree)
  }
}

// lowlight's `common` bundle has no Elixir, the blog's most-used language.
// Register any other language a post needs here; unknown ones fail the build.
const languages = { ...common, elixir }

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeHighlight, {
    detect: false,
    languages,
    plainText: ["text", "txt", "plaintext"]
  })
  .use(images)
  .use(embeds)
  .use(rehypeStringify)

export async function renderMarkdown(
  markdown: string,
  options: RenderOptions = {}
): Promise<string> {
  const file = await processor.process({ value: markdown, data: options })
  // rehype-highlight only warns about an unregistered language and leaves the
  // block uncolored, so turn its messages into build errors.
  if (file.messages.length > 0) throw new Error(file.messages.join("; "))
  return String(file)
}

function requiredString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid ${key}`)
  }
  return value
}

function timestamp(data: Record<string, unknown>, key: string): string {
  const value = requiredString(data, key)
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value
    ) ||
    Number.isNaN(Date.parse(value))
  ) {
    throw new Error(`${key} must be an ISO timestamp with timezone`)
  }
  const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    throw new Error(`${key} has an invalid calendar date`)
  }
  return new Date(value).toISOString()
}

// Every frontmatter key the blog understands. Anything else is a typo — a
// misspelled `videoId` would otherwise publish the article before its video.
const frontmatterKeys = new Set([
  "title",
  "description",
  "publishedAt",
  "updatedAt",
  "tags",
  "videoId",
  "cover",
  "socialImage",
  "estudioSource"
])

export async function parsePost(
  locale: Locale,
  slug: string,
  text: string,
  options: RenderOptions = {}
): Promise<LocalArticle> {
  if (
    !hasLocale(locale) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug === "feed"
  ) {
    throw new Error(`Invalid or reserved post path: ${locale}/${slug}`)
  }
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error("Post must start with YAML frontmatter")
  const data = parse(match[1]) as Record<string, unknown>
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid frontmatter")
  if ("published" in data || "draft" in data) {
    throw new Error("Use a Git branch for drafts; posts in main are published")
  }
  const unknownKeys = Object.keys(data).filter(
    (key) => !frontmatterKeys.has(key)
  )
  if (unknownKeys.length > 0)
    throw new Error(`Unknown frontmatter keys: ${unknownKeys.join(", ")}`)
  const title = requiredString(data, "title")
  const description = requiredString(data, "description")
  const publishedAt = timestamp(data, "publishedAt")
  const updatedAt =
    data.updatedAt === undefined ? null : timestamp(data, "updatedAt")
  if (updatedAt && updatedAt < publishedAt)
    throw new Error("updatedAt precedes publishedAt")
  const tags = data.tags ?? []
  if (
    !Array.isArray(tags) ||
    tags.some((tag) => typeof tag !== "string" || !tag.trim())
  )
    throw new Error("tags must be an array of strings")
  const videoId =
    data.videoId === undefined ? undefined : requiredString(data, "videoId")
  if (videoId && !/^[\w-]{11}$/.test(videoId))
    throw new Error("Invalid videoId")
  const optional = (key: string) =>
    data[key] === undefined ? undefined : requiredString(data, key)
  // A pointer for authors into the private estudio repo; never read here.
  optional("estudioSource")
  const cover = optional("cover")
  const socialImage = optional("socialImage")
  for (const image of [cover, socialImage]) {
    if (image && !/^\/blog\/[\w.-]+$/.test(image))
      throw new Error("Images must be local /blog/ assets")
  }
  const markdown = match[2].trim()
  if (
    !markdown ||
    processor
      .parse(markdown)
      .children.some((node) => node.type === "heading" && node.depth === 1)
  )
    throw new Error(
      "Body must be nonempty; title belongs in frontmatter, headings start at ##"
    )
  if (/\{%/.test(markdown))
    throw new Error("Use [embed](https://…) instead of Liquid tags")
  const url = `${site.url}${blogArticlePath(locale, slug)}`
  return {
    id: `${locale}/${slug}`,
    slug,
    language: locale,
    title,
    description,
    published_at: publishedAt,
    edited_at: updatedAt,
    tag_list: tags,
    videoId,
    cover_image: cover ?? null,
    social_image: socialImage ?? "",
    url,
    canonical_url: url,
    reading_time_minutes: Math.max(
      1,
      Math.ceil(markdown.split(/\s+/).length / 220)
    ),
    body_markdown: markdown,
    body_html: await renderMarkdown(markdown, options)
  }
}
