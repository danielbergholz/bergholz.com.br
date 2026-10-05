import assert from "node:assert/strict"
import { test } from "node:test"
import { parsePost, renderMarkdown, youtubeId } from "./blog-content.ts"

const post = (extra = "", body = "A paragraph.") => `---
title: Example
description: Summary
publishedAt: "2026-10-05T12:00:00Z"
${extra}---

${body}`

test("local posts derive identity, locale and canonical from the file path", async () => {
  const article = await parsePost(
    "en",
    "example",
    post("tags: [ai, elixir]\nvideoId: abcdefghijk\n")
  )
  assert.equal(article.id, "en/example")
  assert.equal(article.language, "en")
  assert.equal(article.url, "https://bergholz.com.br/en/blog/example")
  assert.equal(article.canonical_url, article.url)
  assert.equal(article.videoId, "abcdefghijk")
  assert.deepEqual(article.tag_list, ["ai", "elixir"])
  assert.equal(article.reading_time_minutes, 1)
})

test("invalid metadata, reserved routes and obsolete draft states fail the build", async () => {
  for (const text of [
    post("published: false\n"),
    post("draft: true\n"),
    post("videoID: abcdefghijk\n"),
    post("estudioSource: 42\n"),
    post("tags: ai\n"),
    post("videoId: invalid\n"),
    post("cover: https://example.com/cover.jpg\n"),
    post("updatedAt: 2020-01-01T00:00:00Z\n"),
    post().replace('"2026-10-05T12:00:00Z"', '"2026-10-05"'),
    post().replace("2026-10-05", "2026-02-30"),
    post("", "# Repeated title"),
    post("", "{% embed https://youtu.be/abcdefghijk %}"),
    post("", "```unknown-language\nsome code\n```"),
    post("", ""),
    "No frontmatter"
  ])
    await assert.rejects(parsePost("pt", "example", text))
  await assert.rejects(parsePost("pt", "feed", post()))
  await assert.rejects(parsePost("pt", "../example", post()))
})

test("Markdown preserves GFM, anchors, GIFs and highlighted real code", async () => {
  const html = await renderMarkdown(`## A heading

| Name | Value |
| --- | --- |
| A | B |

![Reaction](https://media.giphy.com/reaction.gif)

\`\`\`js
const answer = 42
\`\`\`

\`\`\`elixir
defmodule Shelf do
  def ok, do: :ok
end
\`\`\`

\`\`\`text
plain output
\`\`\``)
  assert.match(html, /id="a-heading"/)
  assert.match(html, /<table>/)
  assert.match(html, /src="https:\/\/media.giphy.com\/reaction.gif"/)
  assert.match(html, /class="hljs-keyword"/)
  assert.match(html, /<span class="hljs-symbol">:ok<\/span>/)
  assert.match(html, /plain output/)
  await assert.doesNotReject(
    parsePost("pt", "example", post("", "```sh\n# Shell comment\n```"))
  )
})

test("images load lazily and local ones carry their intrinsic size", async () => {
  const html = await renderMarkdown(
    "![Local](/blog/shot.webp)\n\n![Remote](https://media.giphy.com/a.gif)",
    {
      imageSize: (src) =>
        src === "/blog/shot.webp" ? { width: 1600, height: 900 } : undefined
    }
  )
  assert.match(
    html,
    /<img src="\/blog\/shot.webp" alt="Local" loading="lazy" decoding="async" width="1600" height="900">/
  )
  assert.match(
    html,
    /<img src="https:\/\/media.giphy.com\/a.gif" alt="Remote" loading="lazy" decoding="async">/
  )
})

test("unsafe HTML is removed while constructed YouTube and X embeds survive", async () => {
  const html = await renderMarkdown(`<script>alert(1)</script>

<img src="/blog/example.png" onerror="alert(1)">

<iframe src="https://evil.example"></iframe>

[bad](javascript:alert)

[embed](https://youtu.be/abcdefghijk)

[embed](https://x.com/example/status/123456789)

[embed](https://example.com/article)`)
  assert.doesNotMatch(html, /<script|onerror|javascript:|evil\.example/)
  assert.match(
    html,
    /src="https:\/\/www.youtube-nocookie.com\/embed\/abcdefghijk"/
  )
  assert.match(html, /allow="[^"]*fullscreen"/)
  assert.match(
    html,
    /<blockquote class="twitter-tweet" data-dnt="true"><a href="https:\/\/x.com\/example\/status\/123456789">/
  )
  assert.match(
    html,
    /<a href="https:\/\/example.com\/article">https:\/\/example.com\/article<\/a>/
  )
})

test("YouTube embeds require an exact HTTPS host and valid video id", () => {
  assert.equal(
    youtubeId("https://www.youtube.com/live/abcdefghijk"),
    "abcdefghijk"
  )
  assert.equal(youtubeId("https://youtu.be/abcdefghijk?si=123"), "abcdefghijk")
  for (const url of [
    "https://youtube.com.evil.example/watch?v=abcdefghijk",
    "http://youtu.be/abcdefghijk",
    "https://youtu.be/invalid"
  ])
    assert.equal(youtubeId(url), undefined)
})
