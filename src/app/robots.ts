import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

// Only API routes are off limits. /_next/ must stay crawlable: search engines
// need its JS and CSS to render the pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${site.url}/sitemap.xml`
  }
}
