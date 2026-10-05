import { readFileSync, statSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { parsePost } from "../src/lib/blog-content.ts"
import { locales } from "../src/lib/i18n.ts"
import { imageSize } from "../src/lib/image-size.ts"

// Article images ship as-is (no optimizer), so keep each one small: resize
// screenshots to at most 1600px wide and save them as WebP.
const MAX_IMAGE_BYTES = 300 * 1024

const contentDir = path.resolve("content/blog")
// Asset validation is local: publishing never needs a third-party image request.
const localImage = (src: string) => path.resolve(`public${src}`)
const options = {
  imageSize: (src: string) => imageSize(readFileSync(localImage(src)))
}
const posts = []
for (const locale of locales) {
  const dir = path.join(contentDir, locale)
  for (const name of (await readdir(dir)).sort()) {
    if (!name.endsWith(".md")) continue
    try {
      const post = await parsePost(
        locale,
        name.slice(0, -3),
        await readFile(path.join(dir, name), "utf8"),
        options
      )
      for (const image of [post.cover_image, post.social_image]) {
        if (image) statSync(localImage(image))
      }
      for (const [, image] of post.body_html.matchAll(
        /src="(\/blog\/[^"#?]+)"/g
      )) {
        const { size } = statSync(localImage(image))
        if (size > MAX_IMAGE_BYTES) {
          throw new Error(
            `${image} is ${Math.round(size / 1024)} KB; article images must stay under ${MAX_IMAGE_BYTES / 1024} KB`
          )
        }
      }
      posts.push(post)
    } catch (error) {
      throw new Error(`${locale}/${name}: ${String(error)}`, { cause: error })
    }
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
