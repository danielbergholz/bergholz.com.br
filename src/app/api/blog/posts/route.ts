import { getPublishedArticles } from "@/data-access/blog"
import { postLocales } from "@/lib/blog"

// slug → locale for every published post. Prerendered and revalidated with
// the dev.to listing (hourly, or on demand through the "devto" tag); the
// proxy reads it to answer unknown or wrong-locale post URLs with a real
// 404/308 before the page streams (see blogPostRouting in src/lib/blog.ts).
export async function GET() {
  return Response.json(postLocales(await getPublishedArticles()))
}
