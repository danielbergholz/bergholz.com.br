import assert from "node:assert/strict"
import { test } from "node:test"
import { renderMarkdown } from "./blog-content.ts"
import { renderArticleVideo } from "./blog-video.ts"

const messages = {
  videoSoon: "Vídeo sai em breve",
  videoSoonDescription: "Você já pode ler o artigo."
}
const primary = "abcdefghijk"
const cited = "zyxwvutsrqp"

test("a private originating video shows a notice while cited embeds and text survive", async () => {
  const html = await renderMarkdown(
    `Texto pronto.\n\n[embed](https://youtu.be/${primary})\n\n## Fontes\n\n[embed](https://youtu.be/${cited})\n\n[embed](https://x.com/example/status/123456789)`
  )
  const result = renderArticleVideo(html, primary, undefined, messages)
  assert.match(result, /Vídeo sai em breve/)
  assert.match(result, /role="status"/)
  assert.match(result, /Texto pronto/)
  assert.match(result, /id="fontes"/)
  assert.doesNotMatch(result, /youtube-nocookie\.com\/embed\/abcdefghijk/)
  assert.match(result, /youtube-nocookie\.com\/embed\/zyxwvutsrqp/)
  assert.match(result, /platform\.twitter\.com\/embed\/Tweet/)
})

test("the primary embed returns automatically after publication", async () => {
  const html = await renderMarkdown(`[embed](https://youtu.be/${primary})`)
  assert.equal(
    renderArticleVideo(
      html,
      primary,
      { isPublic: true, isUpcoming: false },
      messages
    ),
    html
  )
  const upcoming = renderArticleVideo(
    html,
    primary,
    { isPublic: true, isUpcoming: true },
    messages
  )
  assert.match(upcoming, /Vídeo sai em breve/)
  assert.doesNotMatch(upcoming, /<iframe/)
})

test("pending posts without an embed still explain the upcoming video and escape messages", () => {
  const result = renderArticleVideo("<p>Article.</p>", primary, undefined, {
    ...messages,
    videoSoon: '<script>alert("x")</script>'
  })
  assert.match(result, /Article\./)
  assert.match(result, /&#x3C;script>/)
  assert.doesNotMatch(result, /<script/)
  assert.equal(
    renderArticleVideo("<p>Essay.</p>", undefined, undefined, messages),
    "<p>Essay.</p>"
  )
})
