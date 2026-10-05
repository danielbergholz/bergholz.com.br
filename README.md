# bergholz.com.br

Daniel Bergholz's personal website — built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. Videos and course playlists come from the YouTube Data API; blog articles are Markdown files in this repository.

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

`YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are required. Failed YouTube requests throw instead of caching an empty page. Blog builds need no Dev.to key, revalidation secret or access to the private `estudio` repo.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run format` — format with Biome
- `npm run check` — Biome (lint + format check) and typecheck
- `npm test` — run unit tests (Node's built-in test runner)
- `npm run verify` — check + test + production build
- `npm run content:build` — validate and compile local Markdown (also runs automatically before build, typecheck and tests)

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Server Components and Cache Components
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Instrument Serif + Poppins via `next/font`)
- **Tooling:** Biome for linting and formatting
- **Testing:** Node.js built-in test runner (`node --test`, no extra dependencies)

## Project Structure

- `src/app/[lang]/` — pages and layouts, rendered once per locale (pt-BR at the root, English under `/en`)
- `src/proxy.ts` — locale routing: rewrites unprefixed paths to the Portuguese default, redirects public `/pt/...` URLs
- `src/dictionaries/` — pt/en UI strings, loaded in Server Components only
- `src/components/` — reusable UI components
- `content/blog/{pt,en}/` — published Markdown articles
- `public/blog/` — local article images
- `src/data-access/` — YouTube integration and compiled blog readers
- `src/lib/` — types, utilities, locale helpers (`i18n.ts`), the route registry that generates the sitemap (`routes.ts`), and the pure feed logic (`feed.ts`), with co-located `*.test.ts` unit tests

## Internationalization

The site is bilingual: Brazilian Portuguese is the default and lives at the root (`/videos`), English lives under `/en` (`/en/videos`). There is no i18n library — routing is a `[lang]` segment plus a small proxy rewrite, and translations are two JSON dictionaries. Every page emits `hreflang` alternates and a locale-specific canonical URL, and the sitemap lists both URL sets.

## Blog

Write an article in `content/blog/pt/<slug>.md` (public `/blog/<slug>`) or `content/blog/en/<slug>.md` (public `/en/blog/<slug>`). The filename defines the URL, so keep published filenames stable. The title belongs in frontmatter; body headings start at `##`.

```md
---
title: "A concrete title"
description: "A short summary for cards, SEO and RSS."
publishedAt: "2026-10-05T12:00:00Z"
tags:
  - programming
videoId: "abcdefghijk"
---

Article text…

[embed](https://youtu.be/abcdefghijk)
```

Required: `title`, `description`, `publishedAt` (ISO timestamp with timezone). Optional: `updatedAt` (an actual editorial change, not build time), `tags` (array), `videoId`, `cover` and `socialImage` (files under `public/blog/`, referenced as `/blog/file.png`). Imported articles keep `devtoUrl` for their existing comment threads and `devtoId` for provenance. `estudioSource` optionally names the originating video folder relative to that private repo. There is no `published`/`draft` flag or publication scheduling: work in a branch and merge into `main` to publish through Vercel.

Markdown supports GFM tables, fenced code highlighting, heading anchors, images/GIFs and explicit `[embed](https://...)` links on their own line for YouTube and X/Twitter. Other embed targets remain ordinary links. Raw HTML is sanitized; arbitrary scripts and iframes are removed. GIFs may use `media.giphy.com`; new image origins need the CSP allowlist updated. Prefer local images for long-lived content.

`npm run dev` compiles the articles and watches Markdown changes. Production builds, typechecks and tests compile automatically into ignored `content/blog/.generated/` JSON. The proxy gets a small routing index; article bodies stay on the server. Home, `/videos`, `/blog`, individual articles, sitemap and both RSS feeds read the same corpus. `videoId` identifies the originating video for feed pairing and thumbnails; citing a video in the body does not associate the article with it. Articles without an originating video work independently.

For every article derived from a video, always consult `~/programacao/estudio` (`danielbergholz/estudio`), including its channel instructions and source materials. BR sources are under `canais/br/youtube/<folder>/` (final SRT first); EN sources are under `canais/en/videos/<folder>/` (reviewed transcript first). Scripts, transcripts, research and production notes remain there. Write and revise the final article here, without keeping a second editable `blog.md` in `estudio`.

The 15 previously published Dev.to posts were imported once; `content/blog/migration.json` records their original slugs, locales, dates and external URLs. Their Dev.to copies remain untouched. Legacy drafts were not published. There is no ongoing Dev.to sync, cache webhook or draft upload.

Before publishing a content or code change, run `npm run verify`.

> Working in this repo with an AI coding agent? See [`AGENTS.md`](./AGENTS.md).

## Deploy

Deployed on [Vercel](https://vercel.com). See the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying) for details.
