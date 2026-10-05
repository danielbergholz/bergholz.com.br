import type { Element, Root } from "hast"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { unified } from "unified"

import { isVideoPublished } from "./feed.ts"
import type { VideoDetails } from "./types.ts"

const htmlProcessor = unified().use(rehypeRaw).use(rehypeStringify)

type VideoMessages = {
  videoSoon: string
  videoSoonDescription: string
}

// Only the originating video's trusted embed changes. Cited YouTube videos,
// tweets, highlighted code and the sanitized article text are preserved.
export function renderArticleVideo(
  html: string,
  videoId: string | undefined,
  details: VideoDetails | undefined,
  messages: VideoMessages
): string {
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return html
  if (isVideoPublished(details)) return html

  const notice: Element = {
    type: "element",
    tagName: "figure",
    properties: {
      className: ["article-video-notice"],
      role: "status"
    },
    children: [
      {
        type: "element",
        tagName: "strong",
        properties: {},
        children: [{ type: "text", value: messages.videoSoon }]
      },
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: messages.videoSoonDescription }]
      }
    ]
  }
  const tree = htmlProcessor.runSync({
    type: "root",
    children: [{ type: "raw", value: html }]
  }) as Root
  let replaced = false
  function walk(parent: Root | Element) {
    parent.children = parent.children.map((child) => {
      if (child.type !== "element") return child
      if (
        child.tagName === "figure" &&
        child.children.some(
          (node) =>
            node.type === "element" &&
            node.tagName === "iframe" &&
            node.properties.src ===
              `https://www.youtube-nocookie.com/embed/${videoId}`
        )
      ) {
        replaced = true
        return notice
      }
      walk(child)
      return child
    })
  }
  walk(tree)
  // An article can declare videoId without including an embed in its body.
  if (!replaced) tree.children.unshift(notice)
  return htmlProcessor.stringify(tree)
}
