# bergholz.com.br

Daniel Bergholz's personal website — built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. It pulls in dynamic content from external APIs: videos and course playlists from the YouTube Data API and articles from Dev.to.

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
- `YOUTUBE_COLLAB_CHANNEL_ID` — (optional) host channel to scan for Studio collabs; defaults to Dashbit
- `DEV_TO_API_KEY` — Dev.to API key for articles

`YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, and `DEV_TO_API_KEY` are required. The data-access layer throws on a failed API response (so a broken or empty page is never cached), so the build will error if a required key is missing or invalid.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run format` — format with Biome
- `npm run check` — run lint and typecheck
- `npm test` — run unit tests (Node's built-in test runner)

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

> Working in this repo with an AI coding agent? See [`AGENTS.md`](./AGENTS.md).

## Deploy

Deployed on [Vercel](https://vercel.com). See the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying) for details.
