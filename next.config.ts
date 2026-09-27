import type { NextConfig } from "next"

// Third-party origins this site loads, merged into the shared CSP below.
// dev.to post bodies are rendered as-is, so they bring their CDN images and
// YouTube/Twitter embeds with them.
const allow = {
  script: ["https://plausible.io"],
  connect: ["https://plausible.io"],
  img: ["https://i.ytimg.com", "https://*.dev.to"],
  frame: [
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://platform.twitter.com"
  ]
}

const isDevelopment = process.env.NODE_ENV === "development"

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' covers the Next.js bootstrap and inline JSON-LD scripts;
  // React dev mode needs eval() to reconstruct server error stacks.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} ${allow.script.join(" ")}`,
  // 'unsafe-inline' covers Radix/next-image inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${allow.img.join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' ${allow.connect.join(" ")}${
    isDevelopment ? " ws://localhost:* ws://127.0.0.1:*" : ""
  }`,
  `frame-src ${allow.frame.length > 0 ? allow.frame.join(" ") : "'none'"}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"])
]
  .map((directive) => directive.trim())
  .join("; ")

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy }
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  experimental: {
    // Prerender pages one at a time in a single worker. Every blog post page
    // hits the dev.to API at build time, and the default 9 parallel workers
    // burst enough requests to get throttled (429) — and each worker fetches
    // the listing itself before the shared fetch cache is warm. The site is
    // ~35 pages, so serial generation costs a few seconds at most. (429s
    // are retried inside the dev.to fetch wrapper itself.)
    staticGenerationMinPagesPerWorker: 1000,
    staticGenerationMaxConcurrency: 1
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.dev.to" }
    ]
  },
  async redirects() {
    return [
      { source: "/vegan", destination: "/luisa-e-daniel", permanent: true },
      {
        source: "/en/vegan",
        destination: "/en/luisa-e-daniel",
        permanent: true
      }
    ]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  }
}

export default nextConfig
