# bergholz.com.br

Daniel Bergholz's personal website — built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. It pulls in dynamic content from external APIs: videos and course playlists from the YouTube Data API, and blog posts from Dev.to (which acts as a headless CMS — see [Blog](#blog)).

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Environment variables

Copy `.env.example` to `.env` and fill in:

- `YOUTUBE_API_KEY` — YouTube Data API key
- `YOUTUBE_CHANNEL_ID` — channel ID for fetching videos and playlists
- `YOUTUBE_CHANNEL_ID_BR` — (optional) Brazilian Portuguese channel; its uploads join the content feed and its stats are added to the totals
- `DEV_TO_API_KEY` — Dev.to API key (only the authenticated list, which carries each post's markdown for video pairing, needs it; the blog itself uses the public API)
- `REVALIDATE_SECRET` — (optional) enables `POST /api/revalidate` for on-demand revalidation; see [Blog](#blog)

`YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, and `DEV_TO_API_KEY` are required. The data-access layer throws on a failed API response (so a broken or empty page is never cached), so the build will error if a required key is missing or invalid.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run format` — format with Biome
- `npm run check` — run lint and typecheck
- `npm test` — run unit tests (Node's built-in test runner)
- `npm run revalidate` — expire the site's cached Dev.to data now (see [Blog](#blog))

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Server Components and ISR
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Instrument Serif + Poppins via `next/font`)
- **Tooling:** Biome for linting and formatting
- **Testing:** Node.js built-in test runner (`node --test`, no extra dependencies)

## Project Structure

- `src/app/[lang]/` — pages and layouts, rendered once per locale (pt-BR at the root, English under `/en`)
- `src/proxy.ts` — locale routing: rewrites unprefixed paths to the Portuguese default, redirects public `/pt/...` URLs
- `src/dictionaries/` — pt/en UI strings, loaded in Server Components only
- `src/components/` — reusable UI components
- `src/data-access/` — API integration layer (YouTube, Dev.to)
- `src/lib/` — types, utilities, locale helpers (`i18n.ts`), the route registry that generates the sitemap (`routes.ts`), and the pure feed logic (`feed.ts`), with co-located `*.test.ts` unit tests

## Internationalization

The site is bilingual: Brazilian Portuguese is the default and lives at the root (`/videos`), English lives under `/en` (`/en/videos`). There is no i18n library — routing is a `[lang]` segment plus a small proxy rewrite, and translations are two JSON dictionaries. Every page emits `hreflang` alternates and a locale-specific canonical URL, and the sitemap lists both URL sets.

## Blog

Posts are written and published on [Dev.to](https://dev.to/danielbergholz); the site is their canonical home. The public Forem API is read with ISR (1 hour) and rendered at `/blog/<slug>` (Portuguese posts) and `/en/blog/<slug>` (English posts), split by the `language` field Dev.to reports. Each post's `canonical_url` on Dev.to points back to its page here (set per post in the Dev.to editor). Post bodies arrive as sanitized HTML with Rouge-highlighted code, so there is no Markdown or highlighting dependency — just CSS (`.article-body` in `globals.css`).

Requests to Dev.to are kept to a minimum: the listing is fetched once per hour and shared (via the Data Cache) by the home page, `/videos`, `/blog`, every post page, the sitemap and the RSS feeds (`/blog/feed`, `/en/blog/feed`); each post body is fetched once per hour on top of that. Unknown slugs are answered from the cached listing without calling Dev.to. A new post appears on its first visit (or the next hourly revalidation of `/blog`).

Publishing lives in the content repos (`~/conteudo` for Portuguese, `~/content` for English): their `scripts/sync-devto.sh`, run after a draft goes live on Dev.to, calls `POST /api/revalidate` here (with `REVALIDATE_SECRET`, set on Vercel for Production and Preview) and points the Dev.to `canonical_url` at the post's page on this site. Dev.to cannot call this itself: Forem removed its webhooks API. To refresh by hand, add the secret to `.env` (or `vercel env pull`) and run:

```bash
npm run revalidate
```

> Working in this repo with an AI coding agent? See [`AGENTS.md`](./AGENTS.md).

## Deploy

Deployed on [Vercel](https://vercel.com). See the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying) for details.
