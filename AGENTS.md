# AGENTS.md

Guidance for AI coding agents working in this repo: the personal site of Daniel Bergholz. For the human-facing overview (env vars, structure, writing blog posts), see [README.md](./README.md).

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

Vercel builds run `npm run check && npm test` before `next build` (`vercel.json`), so a lint, type or test failure stops the deploy instead of shipping.

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
- These files are identical in all three repos: `biome.json`, `vercel.json`, `tsconfig.json`, `postcss.config.mjs`, `.gitignore`, `.worktreeinclude`, `.claude/`, `src/lib/{site-config,metadata,current-year}.ts`, `src/lib/routes.test.ts` (except its `pagesDir`), `src/app/{robots,manifest}.ts` and `src/components/{analytics,json-ld}.tsx`.

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

- Data is fetched in Server Components at the page level, then passed to components as props. Pages get the locale with `getLocale()` (`src/lib/locale.ts`, via `next/root-params`) instead of reading `params`; route handlers still read `params`, since root params aren't available there. API integrations and local content readers live in `src/data-access/` (YouTube Data API, compiled Markdown); pure logic lives in `src/lib/`.
- Blog: Markdown in `content/blog/{pt,en}/<slug>.md` is the only source of articles. YAML frontmatter has `title`, `description`, `publishedAt` (ISO timestamp with timezone), optional `updatedAt`, `tags` (array), `videoId`, local `/blog/` `cover`/`socialImage`. Do not add `published` or `draft`: merge into `main` creates the page, unfinished drafts live in branches. The filename is the slug; never rename imported slugs. `scripts/build-blog.ts` validates and compiles Markdown into ignored `content/blog/.generated/` JSON before build/typecheck/tests; `scripts/dev.mjs` watches Markdown for preview updates. `src/data-access/blog.ts` caches the compiled records with `cacheLife("max")`. `src/proxy.ts` uses the generated slug/locale index for real 404/308 responses without HTTP lookup; keep the page fallback too. Render through the sanitized build pipeline in `src/lib/blog-content.ts`, styled by `.article-body`. Unknown frontmatter keys, code fences in unregistered languages and local article images over 300 KB fail the build. Use `[embed](https://...)` on its own line for YouTube or X/Twitter. Use `videoId` only for the originating video; cited videos stay in the body. RSS/canonicals keep each imported post's original URL and publication date.
- Scheduled videos: a finished article can be merged while its `videoId` is private. Its page remains accessible by URL, but home/videos/blog listings, RSS and sitemap use `getDiscoverableArticles` or the same pure `discoverableArticles` filter: linked videos must be public and not upcoming. Direct routing and `generateStaticParams` use the full local corpus, never the discovery filter. Pending pages have `noindex` and replace only the originating embed with the localized upcoming notice (`src/lib/blog-video.ts`); standalone articles appear immediately. YouTube uploads/details revalidate hourly, so publication unlocks discovery and restores the embed automatically without editing the post or redeploying. Missing IDs and unlisted videos stay pending; API errors throw instead of masquerading as pending. Confirm real IDs through estudio's `scripts/ytdata`.
- Blog source material: always consult the private `estudio` repo at `~/programacao/estudio` (GitHub `danielbergholz/estudio`) for transcripts and texts that originated a video. Read its root and channel instructions, then the video's materials: BR `canais/br/youtube/<folder>/` prioritizes final `transcript.srt`, then reviewed `transcript.md`, then `roteiro.md`; EN `canais/en/videos/<folder>/` prioritizes reviewed `transcript.md`. Also consult `briefing.md`, `fontes.md`, fact-check and channel context as applicable. Final article text belongs only here; source transcripts and production notes stay private in `estudio`. Optional `estudioSource` records a relative video-folder path. The site build must never need access to `estudio` or its credentials.
- i18n: the site is bilingual (pt-BR default at the root, English under `/en`), hand-rolled with no i18n library. Pages live under `src/app/[lang]/`; `src/proxy.ts` rewrites unprefixed paths to `/pt` internally and 308-redirects public `/pt/...` URLs. UI strings live in `src/dictionaries/{pt,en}.json` (loaded server-side only — client components receive strings as props); locale helpers are in `src/lib/i18n.ts`, and `localePath()` returns a typed `Route`. When you add or change a string, update BOTH dictionaries — a unit test fails if their shapes diverge.
- Metadata: bilingual pages use `localizedMetadata(locale, path, …)` (`src/lib/localized-metadata.ts`), which wraps `pageMetadata()` with hreflang alternates and the locale's `og:locale`; titles and descriptions come from `dict.meta`. The route registry covers `src/app/[lang]/`, and the sitemap emits every registered page once per locale.
- 404s: unknown URLs match no route and render `src/app/global-not-found.tsx` (`experimental.globalNotFound`), which draws the whole document through `SiteDocument` in the locale the proxy passes as the `x-locale` header — a `[lang]/not-found.tsx` can't catch them because the root layout lives under `[lang]`. Don't add a catch-all route under `[lang]`: it would take those URLs away from the global 404. `[lang]/not-found.tsx` (locale via `next/root-params`) only covers a `notFound()` thrown inside a page. Error boundaries are client components and take their strings from `src/dictionaries/boundary.ts`.
- Social profile URLs live only in `src/lib/socials.ts`; `site.socialLinks`, the home page, `/links` and the footer read them from there.
- Pages render their data directly — no route-level `loading.tsx` or `<Suspense>` skeletons: the data is cached, so a fallback would only ship an extra copy of the page that a script swaps out. The `/videos` search reads and writes `?q=` through `window.location`/`history.replaceState` after mount; `useSearchParams` would opt the whole feed out of server rendering.
- Tests: keep business logic pure and I/O-free — e.g. the feed pairing/filtering lives in `src/lib/feed.ts` and is unit-tested with fixtures, while `src/data-access/` modules stay thin `fetch` wrappers.
