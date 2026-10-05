---
title: "Testing GLM-5.2 on OpenCode: I'm impressed!"
description: "I have a confession: I roll my eyes at AI benchmarks. Every other week someone on Twitter posts a..."
publishedAt: 2026-06-18T09:51:13.988Z
updatedAt: 2026-09-03T14:27:27Z
tags:
  - ai
  - opencode
  - glm52
  - zai
videoId: PSOskeYqvhE
cover: /blog/90348cb44450f8ef0da0.webp
socialImage: /blog/61f5f35f00ece3fbb443.png
devtoUrl: https://dev.to/danielbergholz/testing-glm-52-on-opencode-im-impressed-1780
devtoId: 3931200
estudioSource: canais/en/videos/2026-06-18-glm-5-2-review-and-demo
---

I have a confession: I roll my eyes at AI benchmarks. Every other week someone on Twitter posts a chart where a brand new model is suddenly beating Opus and GPT, the replies go crazy, and then you actually use the thing and it falls apart on the first real task. Beautiful numbers, ugly code.

So when [z.ai](https://z.ai/) shipped **GLM 5.2** and the timeline started shouting that an open-weights model was now nipping at the heels of the frontier labs, my instinct was the usual one. Sure. Prove it.

This post is me proving it. I gave GLM 5.2 a real feature to build on my actual production website, with almost no hand-holding, and watched what happened. Spoiler: I was not expecting to write the sentence I ended up writing.

If you'd rather watch me run the whole thing live (including the part where my tools crashed on camera), the video is right here:

[embed](https://youtu.be/PSOskeYqvhE)

## The claims I was here to test

Let's get the hype out of the way first, because the claims are genuinely big.

[embed](https://x.com/Zai_org/status/2066938937344495629)

GLM 5.2 is the same physical size as GLM 5.1 (744B total parameters, 40B active), but on the Artificial Analysis Intelligence Index it jumped 11 points, from 40 to 51. That score makes it the **leading open-weights model**, ahead of MiniMax-M3 (44), DeepSeek V4 Pro (44) and Kimi K2.6 (43). On the overall leaderboard it sits behind only Claude Fable 5 (60), Claude Opus 4.8 (56) and GPT-5.5 (55). For an open, MIT-licensed model you can download the weights for, that is a wild place to be.

Here is the upgrade at a glance:

| | GLM 5.1 | GLM 5.2 |
| --- | --- | --- |
| Intelligence Index (v4.1) | 40 | **51** |
| Context window | 200K | **1M** |
| Total / active params | 744B / 40B | 744B / 40B |
| Output tokens per task | 26k | **43k** |
| Cost per task | ~$0.25 | ~$0.46 |
| Price (in / cache / out per 1M) | $1.4 / $0.26 / $4.4 | $1.4 / $0.26 / $4.4 |
| License | MIT | MIT |

Two things jump out. First, the context window went from 200K to a full **1 million tokens**, which matters a lot for agentic coding where the harness stuffs your whole repo into the prompt. Second, the price did not move at all. Same cost as 5.1, 11 points smarter.

[embed](https://x.com/ArtificialAnlys/status/2067135640249209175)

That last row in the table is also the explanation for a complaint you'll see online, and I'll come back to it. Numbers on a chart are one thing. Let's go build something.

## My setup: OpenCode plus OpenRouter

For the harness I used [OpenCode](https://opencode.ai/), the desktop app, which has become my go-to playground for trying models that aren't Claude. For the model itself I routed through [OpenRouter](https://openrouter.ai/).

Why OpenRouter and not OpenCode's own provider? Honestly, a small gripe: OpenCode Zen and the Go subscription have been slow to add new open-weights models. GLM 5.2 wasn't on either yet on the day I recorded. OpenRouter had it on day one, so that's where I went. If you want the model, OpenRouter is the path of least resistance right now.

One note for the regulars here: I'm normally a Claude Code person. I pay for Claude Max and I've said many times on this channel that it's the best agent out there. So this isn't a "Claude is bad" video. It's me, a Claude loyalist, genuinely curious whether an open model can hang.

## The test: a real feature on my real site

No toy to-do app. The target was [bergdaniel.com.br](https://bergdaniel.com.br/), my personal website. It's a fully server-rendered Next.js app where, at build time, I hit the dev.to API to populate my blog page and the YouTube API to populate my courses page. Nothing fancy, but it's real code that's actually deployed.

My blog list has grown enough that I wanted a search box. So that was the task. And here's the important part for a model review: **I deliberately gave it almost no context.** No "by the way, we don't have a database," no "remember this is server-rendered with ISR." I wanted to see whether the model would figure out the constraints on its own or trip over them.

This was the entire prompt:

> Help me implement a search feature on the blog page. If possible, use query params and URL state for the search. Example: `?q=`. Whenever the user types something on the search, no need to build an explicit submit button, use debounced searches after waiting like 300 milliseconds.

Then I switched on plan mode and hit submit. The honest test of an agent isn't whether it can follow a spec. It's what it does when the spec is vague.

## Plan mode actually surprised me

GLM 5.2 is a slower, more deliberate model than the other open-weights options. I'd noticed that the day before. But I'll take a slow model that one-shots the feature over a fast one I have to argue with, so I let it think.

First it researched the codebase and reported back, correctly, that my blog page is a server component calling `getArticles`, regenerated with ISR every twelve hours. Then it proposed the plan: keep the page as a server component, add a new client component for the search, debounce each keystroke 300ms, then run a `replace` on the URL so we don't pollute browser history on every letter. Clear X button to reset, empty state when nothing matches.

But the part that got me was the reasoning. It explained, unprompted, *why* it chose client-side filtering:

> Articles are already fetched at build time. Doing the filter client side keeps ISR intact, avoids an extra fetch per keystroke, and lets the URL state be the single source of truth.

That's exactly right. That's the trap I was hoping to watch it fall into, querying the dev.to API on every keystroke at runtime, and it sidestepped it without me saying a word about ISR. It even knew to wrap the component in a Suspense boundary because `useSearchParams` requires it in Next.js. This is the kind of thing I expect from Opus, not from a model I downloaded the weights for.

Then it did something only the frontier models usually do: it asked me good questions before writing code.

- When a search is active, how should the "New" badge behave? (Hide while searching / keep on the first match / always on the latest)
- Which fields should search match against? (Title, description, and tags **(recommended)**)
- What shows when nothing matches? (A "No articles found" message **(recommended)**)

See that `(recommended)` in the options? That's a Claude move. When I talk to Claude models, they almost always mark a recommended choice in parentheses, and it's genuinely useful. Watching GLM do the same, with sensible defaults, was the moment I sat up.

![mind blown](https://media.giphy.com/media/21TDqDLxfIKU8/giphy.gif)

## The code it actually wrote

Talk is cheap, so here's the real output. This is the code that's deployed on my site right now, copied straight from the repo.

First, the change to the blog page. It stayed a server component, kept the ISR revalidation, and just handed the articles off to the new search component:

```tsx
// src/app/blog/page.tsx
import type { Metadata } from "next"

import { BlogSearch } from "@/components/blog-search"
import { getArticles } from "@/data-access/blog"

export const metadata: Metadata = {
  title: "Blog | Daniel Bergholz",
  description: "Daniel Bergholz's blog"
}

export const revalidate = 43200 // 12 hours (twice a day)

export default async function Blog() {
  const articles = await getArticles()

  return (
    <main className="my-14 md:my-28 flex flex-col gap-5 max-w-5xl mx-auto">
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight">
        Blog
      </h1>
      <hr className="w-12 border-t border-current opacity-20" />
      <BlogSearch articles={articles} />
    </main>
  )
}
```

Then the new client component. Notice the `matches` helper that searches across title, description, and tags exactly like I asked, the 300ms debounce, the `router.replace` with `scroll: false`, and the Suspense wrapper at the bottom:

```tsx
// src/components/blog-search.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"

import { Article } from "@/components/article"
import type { Article as ArticleType } from "@/lib/types"

function matches(article: ArticleType, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [article.title, article.description, ...(article.tag_list ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

function BlogSearchInner({ articles }: { articles: ArticleType[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams?.get("q") ?? ""

  const [inputValue, setInputValue] = useState(queryFromUrl)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateUrl = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (value.trim()) {
      params.set("q", value.trim())
    } else {
      params.delete("q")
    }
    const queryString = params.toString()
    router.replace(queryString ? `/blog?${queryString}` : "/blog", {
      scroll: false
    })
  }

  const handleChange = (value: string) => {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateUrl(value)
    }, 300)
  }

  const isSearching = inputValue.trim().length > 0
  const filtered = isSearching
    ? articles.filter((article) => matches(article, inputValue))
    : articles

  return (
    <div className="flex flex-col gap-5">
      <SearchInput value={inputValue} onChange={handleChange} />
      {filtered.length === 0 ? (
        <p className="opacity-50 text-sm md:text-base">
          No articles found for &ldquo;{inputValue.trim()}&rdquo;.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((article, index) => (
            <Article
              key={article.id}
              article={article}
              newPost={!isSearching && index === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function BlogSearch(props: { articles: ArticleType[] }) {
  return (
    <Suspense fallback={null}>
      <BlogSearchInner {...props} />
    </Suspense>
  )
}
```

I trimmed the `SearchInput` sub-component and a couple of effects out of the snippet above so it stays readable, but everything you see is the model's actual code, untouched. The `newPost={!isSearching && index === 0}` line is the answer to its own "New badge" question: hide the badge while searching, show it on the latest post otherwise. It wired its own design decision straight into the JSX.

Design-wise, it matched the rest of my site without being told what the site looks like. Same border treatment, same spacing, same muted opacity. When I tested it, typing "Elixir", "React", "Fable", it filtered instantly, and pasting `/blog?q=fable` straight into the address bar worked too. URL state as the single source of truth, exactly as planned.

![Finished design](/blog/e92a20a3b47fe6965f83.png)

![Finished design part 2](/blog/ddca4e92580afd6e4cd7.png)

## The part I didn't expect to like: restraint

After it finished, I ran `npm run check` and there were a couple of lint warnings. But here's the thing: the warnings were in my Tidewave proxy files, code GLM never touched. And its response was basically, "the one remaining warning is preexisting and unrelated to my changes, so I left it alone."

Some developers will hate that. They want the agent to fix everything it sees. I'm the opposite. If a model starts proactively rewriting files I didn't ask it to touch, that's how you get a 40-file diff for a one-component feature and a code review that takes longer than writing it yourself would have. GLM drew the line exactly where I'd draw it: change what I asked for, run format, check the build, and leave the rest of the repo alone.

For context, my [AGENTS.md](https://github.com/danielbergholz/bergdaniel.com.br/blob/main/AGENTS.md) on this repo has a hard rule:

```md
**IMPORTANT**: After making any code changes, always run:
1. `npm run format` - Format the code
2. `npm run check` - Verify no linting or type errors
3. `npm run build` - Verify the production build succeeds
```

GLM followed it to the letter. It formatted, it checked, it built, and it stopped. That's an agent reading its instructions and respecting their boundaries, which is harder than it sounds.

## Then OpenCode crashed

Now for the honest part, because I'm not going to pretend the run was flawless. Right after I asked it to clean up the commits, OpenCode froze and threw a JavaScript error in the main process. The whole app went down on camera.

![OpenCode crashed](/blog/ac6defcd0fa389c7e59b.png)

To be clear, that's an OpenCode problem, not a GLM 5.2 problem. The model's work was fine. The harness around it fell over. I relaunched, my changes were still there (just not pushed yet), and I pushed them up to deploy. Annoying, but the kind of thing that happens with fast-moving tools, and worth showing instead of editing out.

## The built-in review caught something real

OpenCode ships a `/review` command that spins up a code-reviewer sub-agent. I pointed it at the commit GLM had made and let it go.

It found no bugs, which matches my read of the code, but it did flag two minor things: a subtle input drift while typing, and an acceptable flash on deep links. The input drift was real. The URL-sync effect was re-setting the input from the trimmed URL value about 300ms after each keystroke, which could strip trailing whitespace under your cursor. GLM fixed it cleanly:

```tsx
// src/components/blog-search.tsx  (the fix)
// Keep input in sync when navigating back/forward. Skip when the URL already
// reflects the current input (e.g. trailing whitespace stripped on write) so
// the visible value doesn't shift under the cursor mid-typing.
useEffect(() => {
  if (queryFromUrl === inputValue.trim()) return
  setInputValue(queryFromUrl)
}, [queryFromUrl])
```

One thing worth flagging if you try this: GLM is eager to commit. The moment I used the word "commit" once, it started committing every subsequent change on its own, which isn't my default preference. I like the model to wait for my go-ahead. But to be completely fair, Claude and Codex do the exact same thing once you mention committing, so I can't single GLM out for it. At least it didn't push without asking.

## So, is it actually worth it?

Remember that "43k output tokens per task" row in the table up top? That's the answer to everyone calling GLM 5.2 slow. It isn't slow because it's weak, it's slower because it *thinks more*: 43k output tokens per task versus 26k for GLM 5.1 and 24k for MiniMax-M3. You're paying in latency for more reasoning. After watching the plan it produced, I'll take that trade. A model that one-shots the feature after thinking for an extra minute beats a fast model I have to correct three times.

And the cost? This is the part I forgot to mention in the video, and it might be the most convincing number in the whole post: the entire session, the planning, the implementation, the code review, and the fix, cost me **$0.265**. That is not a typo. Twenty-six cents to ship a real feature to production. Artificial Analysis has GLM 5.2 on the Pareto frontier of intelligence versus cost, and this is what that looks like once you stop reading charts and actually build something. For an open, MIT-licensed model whose [weights](https://huggingface.co/zai-org/GLM-5.2) you can run yourself, that is hard to argue with.

![bargain](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDc3NjVzNzFkZzB4dmRwOWd4MDNrOXpvcXoyY3RvY2wweDM1M3c0dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OjH4qcqxU2u76/giphy.gif)

Here's the sentence I didn't expect to write: **this is the first time an open-weights model has genuinely impressed me on real code.** Not "good for an open model." Just good. The code quality was there, the architectural instincts were there, the questions it asked were the right ones, and the speed felt close to Claude, maybe even a touch faster. From this one feature, GLM 5.2 gets my stamp of approval. I'm genuinely happy we have an open model at this level: competition is good, open weights are good, and a model you can self-host writing Next.js code this clean is a great sign for where this is all heading.

If you want to try it yourself: grab [OpenCode](https://opencode.ai/), point it at [OpenRouter](https://openrouter.ai/), select GLM 5.2, and give it a real task instead of a benchmark. The [z.ai docs](https://docs.z.ai/guides/llm/glm-5.2) have the rest of the details.

If you made it all the way down here, you're awesome, thank you for reading. Let me know in the comments whether you've tested GLM 5.2 and whether it impressed you as much as it impressed me. See you in the next one.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
