# AGENTS.md

Guidance for AI coding agents working in this repo: the personal site of Daniel Bergholz. For the human-facing overview (env vars, structure, the dev.to webhook), see [README.md](./README.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shared template

This site shares one setup with bergholz.com.br, cristinagobbi.com.br and evirtual.com.br. Everything down to "Site-specific notes" is identical in all three repos — when you change the stack, tooling or a convention here, make the same change in the other two.

## Stack

- Next.js 16 App Router with Cache Components, Partial Prefetching and typed routes (`next.config.ts`)
- React 19, TypeScript (strict), Tailwind CSS v4
- Biome for linting and formatting — no ESLint or Prettier
- Node 24 LTS and npm; deployed on Vercel from `main`
- Tests: Node's built-in runner (`node --test`), co-located as `src/**/*.test.ts`
- Analytics: Plausible

## Verifying changes

- While iterating: `npm run lint:fix`, then `npm run check`.
- Before calling a task done or committing: `npm run verify` must pass.

`npm run check` does NOT catch build-time errors. Only the production build surfaces Server/Client boundary violations, invalid `metadata` exports, and Cache Components prerender errors (uncached data or `new Date()` outside a cached scope).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | Biome lint (report only) |
| `npm run lint:fix` | Biome format + safe lint fixes |
| `npm run format` | Biome format only |
| `npm run typecheck` | `next typegen` (route types) + `tsc --noEmit` |
| `npm test` | Unit tests (`node --test`) |
| `npm run check` | Biome check + typecheck |
| `npm run verify` | check + test + build |

## Caching and rendering

- Fetchers live in `src/data-access/`. Each is a `"use cache"` function with `cacheLife` (plus `cacheTag` when it can be revalidated on demand). Route segment configs like `export const revalidate` or `dynamic` are errors under Cache Components.
- Keep `next: { revalidate }` on the `fetch` itself too: `"use cache"` entries live in memory per instance and deployment, while the fetch Data Cache persists across deploys.
- Never read the clock while rendering (`new Date()`, `Date.now()`): use `getCurrentYear()` from `src/lib/current-year.ts` or another cached helper.
- Pages stream a static shell first, so `notFound()` or `redirect()` inside a page can't set a 404/308 status on the first visit to a URL. Decide status codes in `src/proxy.ts` or `next.config.ts` redirects.

## Site config, metadata and files

- `src/lib/site.ts` holds the per-site settings (`site`, shaped by `SiteConfig` in `src/lib/site-config.ts`): names, URL, colors, share image, Plausible script id and social links. Read the domain, names and links from it — never hard-code them.
- Page metadata goes through `pageMetadata()` (`src/lib/metadata.ts`); the root layout spreads `rootMetadata` plus the home page's `pageMetadata()`. Next replaces `openGraph` and `twitter` per segment instead of merging them, so a page that writes its `metadata` by hand shares with the home page's title, URL or image.
- Public pages are registered in `src/lib/routes.ts`. `sitemap.ts` is generated from it (pages carry no `lastModified` — it would just be the build date), and `routes.test.ts` fails when the registry and the pages on disk disagree.
- Every site has the same files in `src/app/`: `robots.ts`, `manifest.ts`, `sitemap.ts`, `error.tsx` and `global-error.tsx` (recover with `retry`, not `reset`) and `not-found.tsx`. Icons are `favicon.ico`, `apple-icon.png` and `icon.png` (or `icon0.svg` + `icon1.png` when there's also an SVG); `public/` has `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` and a 1200×630 `og.png`.
- `<Analytics />` (`src/components/analytics.tsx`) loads Plausible from the root layout's `<head>`.
- These files are identical in all three repos: `biome.json`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `.worktreeinclude`, `.claude/`, `src/lib/{site-config,metadata,current-year}.ts`, `src/lib/routes.test.ts` (except its `pagesDir`), `src/app/{robots,manifest}.ts` and `src/components/{analytics,json-ld}.tsx`.

## Security headers

`next.config.ts` sends a Content-Security-Policy and the other security headers from a block that is identical across the three sites. Each site's third-party origins go in the `allow` object at the top of the file — a new script, image host or embed has to be added there, or the browser blocks it.

## Conventions

- Style (Biome): 2-space indent, double quotes, no semicolons, no trailing commas, 80 columns.
- Suppress a rule inline with `// biome-ignore lint/<rule>: <reason>` and a real reason.
- Use the `@/*` alias for `src/*`, except in modules imported by tests: `node --test` doesn't resolve the alias, so those use relative `.ts` imports.
- Use `import type` for type-only imports.
- Links are typed routes: type computed hrefs as `Route` (from `next`) and check them against real pages.
- JSON-LD goes through `<JsonLd data={...} />` (`src/components/json-ld.tsx`), which escapes `<`; build its URLs and `sameAs` links from `site`.
- `.env*` files are git-ignored; secrets live in Vercel. `.worktreeinclude` copies them into new worktrees, and the SessionStart hook (`.claude/hooks/session-start.sh`) syncs `main` and runs `npm ci`.

## Site-specific notes

- Data is fetched in Server Components at the page level, then passed to components as props. API integrations live in `src/data-access/` (YouTube Data API, Dev.to); pure logic lives in `src/lib/`.
- Blog: Dev.to is the headless CMS. Every Dev.to fetcher in `src/data-access/blog.ts` is cached for an hour and tagged `devto` (both `"use cache"` and the fetch Data Cache), so the listing is fetched once per hour and shared across routes — keep it that way (the API has no published rate limit; treat it as scarce). `POST /api/revalidate` expires the tag. Posts live under the locale matching their Dev.to `language` (`/blog/<slug>` for `pt`, `/en/blog/<slug>` for `en`). `src/proxy.ts` answers unknown slugs with a 404 and wrong-locale URLs with a 308, using the slug map served at `/api/blog/posts`; the page keeps its own `notFound()`/redirect as a fallback and gates on the cached listing, so unknown slugs never hit Dev.to. Throw on API errors (never `notFound()` on a failure) so the last good page keeps being served. `body_html` is rendered as-is and styled by `.article-body` in `globals.css` — no Markdown/highlighting libraries; its CDN images and YouTube/Twitter embeds are allowed in the CSP.
- i18n: the site is bilingual (pt-BR default at the root, English under `/en`), hand-rolled with no i18n library. Pages live under `src/app/[lang]/`; `src/proxy.ts` rewrites unprefixed paths to `/pt` internally and 308-redirects public `/pt/...` URLs. UI strings live in `src/dictionaries/{pt,en}.json` (loaded server-side only — client components receive strings as props); locale helpers are in `src/lib/i18n.ts`, and `localePath()` returns a typed `Route`. When you add or change a string, update BOTH dictionaries — a unit test fails if their shapes diverge.
- Metadata: bilingual pages use `localizedMetadata(locale, path, …)` (`src/lib/localized-metadata.ts`), which wraps `pageMetadata()` with hreflang alternates and the locale's `og:locale`; titles and descriptions come from `dict.meta`. The route registry covers `src/app/[lang]/`, and the sitemap emits every registered page once per locale.
- 404s: unknown URLs match no route and render `src/app/global-not-found.tsx` (`experimental.globalNotFound`), which draws the whole document through `SiteDocument` in the locale the proxy passes as the `x-locale` header — a `[lang]/not-found.tsx` can't catch them because the root layout lives under `[lang]`. Don't add a catch-all route under `[lang]`: it would take those URLs away from the global 404. `[lang]/not-found.tsx` (locale via `next/root-params`) only covers a `notFound()` thrown inside a page. Error boundaries are client components and take their strings from `src/dictionaries/boundary.ts`.
- Tests: keep business logic pure and I/O-free — e.g. the feed pairing/filtering lives in `src/lib/feed.ts` and is unit-tested with fixtures, while `src/data-access/` modules stay thin `fetch` wrappers.
