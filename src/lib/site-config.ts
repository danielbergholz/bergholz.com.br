// Shape of src/lib/site.ts: the per-site settings read by the shared template
// modules (metadata, manifest, robots, analytics). This file is identical in
// every site built on the template; only the values in site.ts differ.
export type SiteConfig = {
  // Short name: Open Graph site name, manifest short_name, web app title.
  name: string
  // Default page title (the home page) and manifest name.
  title: string
  description: string
  // Canonical origin, without a trailing slash.
  url: string
  // BCP 47 tag of the default language, e.g. "pt-BR".
  language: string
  // Open Graph locale of the default language, e.g. "pt_BR".
  ogLocale: string
  author: { name: string; url?: string }
  themeColor: string
  backgroundColor: string
  // Default share image: a 1200×630 PNG in public/ (WebP breaks many link
  // previews).
  ogImage: { url: string; width: number; height: number; alt: string }
  twitterHandle?: string
  // Plausible script id, from Site settings → Site installation.
  plausibleScriptId: string
  // Whether public/web-app-manifest-*.png are full-bleed, so launchers may
  // crop them into a circle or squircle ("maskable").
  maskableIcons: boolean
  socialLinks: readonly { name: string; href: string }[]
}
