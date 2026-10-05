---
title: "Escaping Claude Code Lock-In: My Open-Source AI Stack (OpenCode + OpenRouter)"
description: I have been a Claude fanboy for about two years now. Let me say this clearly before I start...
publishedAt: 2026-06-25T13:36:44.200Z
updatedAt: 2026-09-03T14:27:21Z
tags: []
videoId: VR7hvwwk_Qk
cover: /blog/cba0312dd45809d7a412.webp
socialImage: /blog/465cbb715bc8532ad1ed.png
estudioSource: canais/en/videos/2026-06-23-alternatives-to-claude-code
---

I have been a Claude fanboy for about two years now. Let me say this clearly before I start complaining: Claude is an amazing model, and Claude Code is the best agent I have used. I pay for Claude Max, I use it every day on my job, and I am not going to pretend otherwise.

But here is the problem with building your whole workflow on one closed model: the company can take it away whenever it wants. That is exactly what happened when Anthropic announced they were [removing our access to Fable](https://www.anthropic.com/news/fable-mythos-access). One day you have an amazing model, the next day someone in a boardroom decides you do not get it anymore, and you are stuck. I hate being that dependent on a single company.

So I did something I should have done a long time ago: I started diversifying my AI portfolio. This post is the open-source stack I landed on, and the five tools I looked at to get there.

If you would rather watch me click through all of this live (and see the actual CourseShelf code running), the video is here:

[embed](https://youtu.be/VR7hvwwk_Qk)

## The lock-in problem, and why Fable was my wake-up call

There is a second thing that bugs me about Claude and GPT, beyond the lock-in. These companies keep pretending they are the good guys fighting some great evil. And I keep asking: who exactly is the enemy here?

Because their supposed enemies publish [full research papers](https://api-docs.deepseek.com/news/news260424) anyone can read, and ship open-weights models you can download and run on your own machine. Show me one open-source model from Claude or GPT. There are none. Zero.

Meanwhile the biggest complaint these labs have against their rivals is data: that they are doing whatever they want with your data, mass surveillance, the whole speech. And then I read [the Fable announcement](https://www.anthropic.com/news/claude-fable-5-mythos-5): a 30-day retention requirement for all traffic on the new Mythos-class models. So you are telling me about predatory data practices while requiring 30-day retention on every request? That does not feel like the good guys to me.

I am not trying to be dramatic. I still use Claude Code at work. But after Fable, I decided I would never again let a single closed company be a single point of failure for my side projects. We finally have open-weights models that are genuinely good. It is time to give them a real chance.

So, what are the realistic alternatives to Claude Code and Codex today? I looked at five tools. Two are closed source, three lean open. Here is how each one shook out.

## The closed-source options: Cursor and AMP

### Cursor

[Cursor](https://cursor.com/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code) is both an agent harness and a model provider. You download the Cursor IDE, which is now a desktop app for managing agents, or you use their CLI, and they give you access to the models too: the Claude family, Gemini, GPT, Grok, and now their own model, Composer (the latest is Composer 2.5).

Credit where it is due: the Cursor desktop app is probably the best app I have ever used for managing parallel agents. If raw experience were the only axis, it would be an easy recommendation.


![Cursor](/blog/0aebae796c6d3a3cd2ec.webp)



But Cursor falls under the same problem as Anthropic and OpenAI. Everything they do is closed source. Composer 2.5 is proprietary, the research is not public, and the weights are not open. Worse, they used to be more open: you could plug in basically any model. Now you are locked to Anthropic and OpenAI. If you want to use a Chinese open-weights model like GLM, DeepSeek, or MiniMax, you cannot.

So do I recommend Cursor? Not right now, if your goal is to use open-source stuff. If you genuinely do not mind the vendor lock-in, then sure, go for it, and use their Composer model, because it is substantially cheaper than the Anthropic and OpenAI ones.

### AMP Code

[AMP](https://ampcode.com/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code) is also closed source. It is an agent harness: you download their CLI, and they have a nice web interface for managing the CLI agents.


![AMP](/blog/3b6bc5eaf1ee0e1ece3f.webp)



But here is the catch. AMP is not an LLM provider. Their entire mission is to build the harness for you and pick the models for you. You cannot plug DeepSeek into AMP. You choose an agent mode, and that is it. You cannot say "run the rush agent mode with GLM" or "run the deep agent mode with MiniMax." In theory that is nice, because you skip the analysis paralysis of picking a model. In practice you are still dependent on Claude and GPT.

And because AMP is a third-party harness, you also lose access to subsidized tokens. Claude can charge very cheap prices because their strategy is to dominate the world first and lose billions of dollars doing it. A small startup like AMP does not have billions to burn, so you pay raw API pricing for Claude and GPT, which is insanely high.

![empty wallet](https://media.giphy.com/media/U2ohLOGkVSENpp4idH/giphy.gif)

So do I recommend AMP? No. If you genuinely believe the multi-agent workflow where they pick the models for you is fine, and you do not mind paying API pricing for closed models, then maybe AMP is for you. I cannot seriously recommend it right now.

## The open-source harnesses: Pi and OpenCode

Now for the good stuff.

### Pi coding agent

[Pi](https://pi.dev/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code) is an open-source coding harness. It does not include the LLMs, so you choose a provider inside Pi to pick a model. The philosophy is to be minimal and customizable: your agent has access to a handful of tools (read files, write files, run Bash) and nothing else. Need web search? You install a plugin. You can edit the system prompt, you can edit some markdown files that get appended after it. If you ever wanted to build your own agent on an open-source base, Pi is my recommendation.


![Pi](/blog/c402016d0d37642e4755.webp)


So why am I not using it? I love that it is open source. But I do not love that it is customizable by default.

Some people claim that most of the harness around Claude Code, Codex, and Cursor is bloat, and that if you strip it down the agent performs better. I do not agree with that at all. There are companies pouring millions of dollars into building the best harness we can get, and you are seriously telling me all that money is wasted? I do not think so. I think the harness matters.

I want somebody else to build the harness for me. I have zero interest in customizing it. I am not an AI expert, I am a programmer, and as a programmer I want a tool that is ready to pick up, use, and be done with.

### OpenCode

Which brings me to my current default recommendation: [OpenCode](https://opencode.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code). As the name implies, it is open source, with almost 200,000 stars on GitHub.


![OpenCode](/blog/f9ca2c2205af35421e1f.webp)



It is an agent harness (CLI plus a desktop app), but it is also an LLM provider, and it gives you two ways to pay:

| Plan | How it works | Models you get |
| --- | --- | --- |
| **Zen** | Usage-based: add credits, pay as you go | Claude family, GPT, Gemini, plus Chinese models (DeepSeek, GLM, Kimi, MiniMax) |
| **Go** | Subscription: $5 the first month, $10 after | Mostly smaller, cheaper, open-weights models (Kimi K2.7 Code, GLM 5.2, MiniMax, DeepSeek). No frontier models |

The Go subscription is how they keep the price so low: you trade away the frontier models for the cheaper open-weights ones. Honestly, those open-weights models are exactly what I want right now. But I do not want yet another subscription. I already pay for Claude Code for my day job. For my side projects I only build new features now and then, so locking myself into a monthly plan makes no sense. I just want to pay for what I use.

## Why I pair OpenCode with OpenRouter instead of Zen

So I run OpenCode as my harness, but for the models I do not use OpenCode Zen. I use [OpenRouter](https://openrouter.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code).

Why not Zen? Availability. Look up Kimi K2.7 on Zen and you will find it is only on the Go subscription, not on usage-based Zen. GLM 5.2 did eventually land on Zen, but it took a while. I am a YouTuber. I record tutorials all day, every day, and I need the newest models the moment they drop. If I have to wait for them to show up, that is a problem.

OpenRouter solves this. The idea: one API key, access to 400+ models. And it is high availability, because every model has multiple providers behind it. Take DeepSeek V4 Flash: OpenRouter lists eleven providers for it. If the first provider fails for any reason, it tries the second, then the third, and so on. That makes it extremely reliable.

![OpenRouter](/blog/9d5e5b392ba48c8b6def.webp)

The other thing I care about is data policy. In my OpenRouter account, under privacy preferences, I set non-frontier models to only use zero-data-retention endpoints, which means my interactions are not used to train the model. You even get a live preview of which models stay available once you tick those boxes. If I also block Anthropic and OpenAI (because they do not offer zero data retention), the list shrinks and some Claude and GPT models simply disappear from it. That is fine by me.

Pricing works like Zen: add credits, create an API key, use that key wherever you want. I connected my OpenCode desktop app to OpenRouter, and I get a clean dashboard of total spend, activity graphs, and per-call logs showing which model ran, what it cost, which API key called it, and which provider served it.

## The part I actually love: one key powers my SaaS too

Here is what makes OpenRouter more than a coding gateway for me. The same API key that runs my coding agent also powers the AI features inside my SaaS, [CourseShelf](https://thecourseshelf.com/).

CourseShelf is a directory of courses. It used to be that when a course was added, someone had to pick its tags by hand. Now that happens automatically: DeepSeek V4 Flash reads the course and chooses the tags, and an OpenAI embedding model builds a vector so I can rank related courses. Both calls go through the one OpenRouter key.

The client is a thin wrapper over the OpenRouter chat-completions and embeddings endpoints, using `Req`. Notice the two model names and the two URLs, this is the real file:

```elixir
# lib/course_shelf/ai.ex
defmodule CourseShelf.AI do
  @chat_url "https://openrouter.ai/api/v1/chat/completions"
  @embeddings_url "https://openrouter.ai/api/v1/embeddings"

  # text-embedding-3-small is the boring, reliable default (1536 dims, 8k
  # context, $0.02/M); switching models later is a config change.
  @default_embedding_model "openai/text-embedding-3-small"

  # Cheapest tier with strong structured-output support on OpenRouter.
  # DeepSeek V4 Flash is a reasoning-capable MoE that defaults to high-effort
  # chain-of-thought; we disable reasoning (`reasoning.effort: "none"`) for
  # the classification/tagging workload — CoT is dead weight against a fixed
  # taxonomy and would bill output tokens we don't need.
  @default_model "deepseek/deepseek-v4-flash"
  @default_max_tokens 1024
```

The tagging call asks DeepSeek for schema-shaped JSON back, using OpenRouter's `response_format: json_schema` structured-outputs feature, so I never have to parse loose prose into tags:

```elixir
# lib/course_shelf/ai.ex
def structured_output(opts) do
  schema = Keyword.fetch!(opts, :schema)
  schema_name = Keyword.fetch!(opts, :schema_name)

  body = %{
    model: Keyword.get(opts, :model, @default_model),
    max_tokens: Keyword.get(opts, :max_tokens, @default_max_tokens),
    messages: [
      %{role: "system", content: Keyword.fetch!(opts, :system)},
      %{role: "user", content: Keyword.fetch!(opts, :prompt)}
    ],
    response_format: %{
      type: "json_schema",
      json_schema: %{name: schema_name, strict: true, schema: schema}
    },
    # `effort: "none"` disables reasoning.
    reasoning: %{effort: "none"}
  }

  with {:ok, api_key} <- fetch_api_key() do
    request(api_key, body)
  end
end
```

The actual instruction that tags a course is just a system prompt. Here is a trimmed version of the real one:

```elixir
# lib/course_shelf/courses/tag_classifier.ex
@system_prompt """
You categorize courses for a learning directory that spans many fields — \
programming, design, business, marketing, fitness, music, cooking, and more. \
Not every course is technical.

You are given a course (title and description) and the directory's existing \
tag taxonomy, grouped by tag type. Each existing tag is shown as "Name (slug)".

Choose the tags that best describe what the course actually teaches:

- Tag only what the course is genuinely about...
- Prefer specific tags over generic ones, and prefer existing tags...
- Pick only the most relevant tags — usually 2 to 4. Do not pad the list.
"""
```

The embeddings call is even smaller. Same key, same `Req` client, just the OpenAI embedding model instead:

```elixir
# lib/course_shelf/ai.ex
def embed(opts) do
  body = %{
    model: Keyword.get(opts, :model, @default_embedding_model),
    input: Keyword.fetch!(opts, :input)
  }

  with {:ok, api_key} <- fetch_api_key() do
    embed_request(api_key, body)
  end
end
```

And the config is one environment variable. One key, both endpoints, the app-attribution headers so CourseShelf shows up on the OpenRouter apps page:

```elixir
# config/runtime.exs
config :course_shelf, CourseShelf.AI,
  api_key: System.get_env("OPENROUTER_API_KEY"),
  # App-attribution headers so CourseShelf shows on openrouter.ai/apps.
  http_referer: "https://thecourseshelf.com",
  app_title: "CourseShelf"
```

In the OpenRouter logs I can watch DeepSeek V4 Flash tagging courses and the OpenAI model creating embeddings, and I can see the provider rotating under the hood (Wafer on one call, then DeepInfra, then DigitalOcean). One key for my editor and my product. That is the part that sold me.


![OpenRouter logs](/blog/f6cd9c79d95554c60686.webp)



## What about Vercel AI Gateway?

If you do not want OpenRouter, there is a direct competitor: [Vercel AI Gateway](https://vercel.com/ai-gateway?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code). It works exactly the same way: add balance, get an API key, drop that key into OpenCode or into your app, done.

So why am I on OpenRouter instead? Honestly, this one is personal preference. I am not a fan of Vercel. I think they are also a fairly predatory company, and I think they made some genuinely bad decisions with Next.js, their web framework. So whenever I can avoid Vercel, I do.

## My open-source stack, in one line

That is it. **OpenCode as the harness, OpenRouter as the model provider.** One open-source agent I do not have to babysit, one API key that reaches 400+ models and also powers the AI inside my SaaS, and zero dependence on any single closed lab being in a good mood.

To be clear, this is not a "Claude is bad" post. Claude is great, and I will keep using Claude Code at work. But for my own projects, I would rather not hand a single company the power to pull the rug out from under me again. We have excellent open-weights models now. Give them a chance.

If you want to copy my setup: grab [OpenCode](https://opencode.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code), point it at [OpenRouter](https://openrouter.ai/?utm_source=danielbergholz&utm_medium=blog&utm_campaign=alternatives-to-claude-code), add a few dollars of credit, and pick an open model like DeepSeek or GLM. That is the whole stack.

If you made it all the way down here, you are awesome, thank you for reading. See you in the next one.

![the end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
