/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        protocol: "https",
        hostname: "i.ytimg.com"
      },
      {
        protocol: "https",
        hostname: "**.dev.to"
      }
    ]
  }
}

export default nextConfig
