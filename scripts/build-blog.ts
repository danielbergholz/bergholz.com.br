import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { parsePost } from "../src/lib/blog-content.ts"
import { locales } from "../src/lib/i18n.ts"

const contentDir = path.resolve("content/blog")
const posts = []
for (const locale of locales) {
  const dir = path.join(contentDir, locale)
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith(".md")) continue
    try {
      posts.push(
        await parsePost(
          locale,
          name.slice(0, -3),
          await readFile(path.join(dir, name), "utf8")
        )
      )
    } catch (error) {
      throw new Error(`${locale}/${name}: ${String(error)}`, { cause: error })
    }
  }
}
// Asset validation is local: publishing never needs a third-party image request.
for (const post of posts) {
  const images = [
    post.cover_image,
    post.social_image,
    ...Array.from(
      post.body_html.matchAll(/src="(\/blog\/[^"#?]+)"/g),
      (match) => match[1]
    )
  ]
  for (const image of images) {
    if (image) await readFile(path.resolve(`public${image}`))
  }
}
posts.sort((a, b) => b.published_at.localeCompare(a.published_at))
const output = path.join(contentDir, ".generated")
await mkdir(output, { recursive: true })
const files = {
  "articles.json": posts,
  "index.json": posts.map(({ slug, language }) => ({ slug, language }))
}
for (const [name, data] of Object.entries(files)) {
  const file = path.join(output, name)
  const text = `${JSON.stringify(data)}\n`
  let previous: string | undefined
  try {
    previous = await readFile(file, "utf8")
  } catch {}
  if (previous !== text) await writeFile(file, text)
}
console.log(`Compiled ${posts.length} Markdown posts`)
