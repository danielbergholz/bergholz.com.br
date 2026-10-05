---
title: "Superconductor review: the cleanest way I've found to run AI agents in parallel"
description: I use Claude Code every single day. At my day job, it's my main agent, and I've talked plenty about...
publishedAt: 2026-06-22T23:33:02.806Z
updatedAt: 2026-09-03T14:27:24Z
tags:
  - ai
  - superconductor
  - claude
  - openai
videoId: T5G_aUIEwEk
cover: /blog/6f842966bc77014c3c1f.webp
socialImage: /blog/92676fdcb7d1ec0b91a0.png
estudioSource: canais/en/videos/2026-06-22-run-parallel-agents-with-superconductor
---

I use Claude Code every single day. At my day job, it's my main agent, and I've talked plenty about how much I love it. But on my side projects, I like to play around with other agents: Codex, OpenCode, whatever new CLI shows up that week. And recently I hit a wall that turned out to be more annoying than I expected.

I wanted to run a bunch of agents in parallel. Not one at a time, but several, across different projects, at the same time. And the moment I tried to do that, I realized every tool was trying to lock me into its own little world.

So I went looking for something better, and I found a product I've been using for the past few days that I genuinely can't stop recommending. This is **not** sponsored. I'm paying nothing and using it on my own machine. It's called [Superconductor](https://super.engineering/?ref=danielbergholz), and this post is my honest review.

If you'd rather watch me click through the whole thing instead of reading, the full walkthrough is right here:

[embed](https://youtu.be/T5G_aUIEwEk)

## Why I needed this in the first place

Here's the situation. If I'm on Claude, I can open the Claude desktop app and run multiple Claudes in parallel. Cool. I can do the same with OpenAI's Codex app. Also cool.

But what if I want a different agent? What if I want to run OpenCode, or the Pi coding agent? Suddenly I'm stuck. Each desktop app only knows about its own provider. The second I commit to one app, I'm locked into whatever model that company ships.

I don't want that. I want one interface that doesn't care which agent I'm using. One place where I can run Claude Code for my day job and Codex for my side projects, side by side, without juggling three separate apps. **Agent-agnostic** is the whole point.

![This is the way](https://media.giphy.com/media/stnjSj2vpLcM4rwmEH/giphy.gif)

That's exactly what Superconductor is: a single workspace for running coding agents in parallel, across different projects and different worktrees, with whatever agent you feel like using.

## What Superconductor actually is

A few things make it stand out before we even open it.

First, it's written **100% in Rust**. No Electron. The whole thing is a native macOS binary rendered on your GPU with Metal, and the startup time is around **50 milliseconds**. That number sounds like marketing until you feel it. Some of the provider apps, like the Codex app, are genuinely nice but also pretty janky. Every time you open a sidebar, it slides in this sluggish way. Superconductor just snaps. Everything is instant.

Second, because it's built for developers, it's absolutely covered in keyboard shortcuts. You can drive the entire app without touching the mouse. Here are the ones I lean on the most:

| Shortcut | What it does |
| --- | --- |
| `Cmd + Shift + E` | Toggle the left side panel |
| `Cmd + E` | Toggle the right side panel |
| `Cmd + Shift + A` | Add a new project |
| `Cmd + T` | Open your default agent (Claude Code, for me) |
| `Cmd + Shift + T` | Pick from all available agents |
| `Cmd + W` | Close the current tab |
| `Cmd + N` | Create a new worktree |
| `Cmd + R` | Run your run script (dev server, etc.) |
| `Option + Cmd + Left` | Switch between workspaces |

Let me walk through how I actually use it.

## The layout

On the left, you have your projects. Open a project folder and you see all of its worktrees. Right now I just have the main branch for two projects: my personal website and CourseShelf v2. That starred branch row is the **primary worktree**, which is just the original checkout Superconductor opened, the source of truth you branch off from.

![Default view](/blog/e175c39b201bcb106921.png)

On the right, you have a panel you can fully customize. By default it shows your files, changes, and checks on top, and a terminal on the bottom (where you can also wire up a run script and a setup script, more on that in a second).

I don't love that default arrangement, so I switched it to show two tabs on the right instead: one for my terminal with setup and run, and another for my files. It takes ten seconds and the layout sticks.

![My custom view](/blog/9a5a5169be39ad0a6dff.png)

Adding a new project is just `Cmd + Shift + A` (or the "Add Project" button on the bottom left), pick your folder, done.

## Starting an agent

This is where the "just like a browser" mental model clicks. Press `Cmd + T` to open your default agent, which in my case is Claude Code. Or press `Cmd + Shift + T` to pick from every agent you've got configured. Superconductor supports a long list out of the box: Claude Code, Codex, Gemini CLI, OpenCode, Cursor Agent, Grok, Pi, Kiro, Copilot, basically any CLI agent you already use.

![Agent picker](/blog/cbb5d964a48efee89e4c.png)

There's a native chat UI too, where you can switch providers and models from a dropdown. It's nice. But honestly, I almost always stick to the CLIs. So I'll close the chat with `Cmd + W`, hit `Cmd + Shift + T` again, choose "terminal," and just run the CLI straight from there. The point is, Superconductor doesn't force a workflow on you. CLI, native chat, plain terminal, it's your call.

One thing worth knowing: it never routes your prompts or code through its own servers. You bring your own provider CLIs and your own subscriptions, and everything stays local. No account to create, no credentials proxied anywhere.

## Running real parallel work

Let me actually test the parallel part. I'll open a tab for OpenCode and pick a model. Do they have Kimi? Nope, not yet. Fine, I'll grab DeepSeek V4 Pro on high reasoning and ask it: "what is this project about?" Enter.

Now I switch tabs to another project and start a second agent. I'd normally reach for Claude Fable here, but it got banned right when I was recording this, so I switched to Claude Opus on X-high effort instead. Same question: "what is this project about?"

And that's it. Two agents, two different providers, two different projects, both working at the same time. I flip between tabs and watch OpenCode finish while Opus is still thinking. This already solves my original problem: multiple agents, multiple projects, zero provider lock-in.

![Two providers](/blog/3d77161820e429696d4b.png)

But running across separate projects is the easy case. The real question is: what about parallel work **inside the same project**?

## Worktrees: parallel work inside one project

This is where worktrees come in, and where Superconductor gets genuinely clever.

To create a new worktree, press `Cmd + N` (or the plus button). Under the hood you're still using Git, but a worktree copies your codebase into a brand new folder so each task gets its own isolated working directory. Concurrent agents never step on each other's files. That's the whole appeal.

But copying your code into a fresh folder creates two very real headaches:

1. **Environment variables.** Your `.env` is gitignored, so a fresh worktree doesn't have it. Your new folder is missing the one file your app can't run without.
2. **Dependencies.** No `node_modules` either. So... do I have to manually run `npm install` every single time I spin up a worktree?

If that's the deal, this feature is dead on arrival. Nobody wants to babysit `npm install` and copy `.env` files by hand all day.

Worry not, my friend. This is exactly the problem the scripts solve.

## The magic: setup and run scripts

Open your project settings (you can do this per project on the left sidebar), scroll down, and you'll find the **scripts** section. This is where everything gets automated.

There are a few hooks. The two I care about are:

- **Setup script** runs automatically whenever a new worktree is created.
- **Run script** runs when you hit the run button.

For my personal website, my setup script does two things: copy my environment variables from the main folder into the new worktree, then run `npm install`. My run script is simply `npm run dev`.

You can configure these in the app's project settings, or commit them to your repo so the whole team shares them. Superconductor reads a `.superconductor/config.json` from the worktree (falling back to the primary worktree if there isn't one):

```json
// .superconductor/config.json
{
  "setup": ["cp ../main/.env .env", "npm install"],
  "run": ["npm run dev"],
  "teardown": ["rm -rf tmp/superconductor-preview"]
}
```

> The `setup` array is what runs on a fresh worktree, `run` is what the run button executes, and `teardown` cleans up when you delete a worktree. (My actual setup uses my own paths for the env copy, so treat the `cp` line above as the shape of it, not my literal command.)

Now watch what happens. I press `Cmd + N` on my Next.js personal website. The setup script kicks off, and I can see its output right there in the panel: `added 49 packages`. That's the classic `npm install` output. The worktree is ready to go.

![Creating new worktree](/blog/9c44edb75cb6701a13a7.png)

Jump to the files and check it out. First, `node_modules` is there, so dependencies are installed. Second, my `.env` is sitting right there too. I didn't run a single `cp` or `npm install` by hand. It's all automated. Create another worktree with `Cmd + N` and the same thing happens again: dependencies, env vars, ready.

![Files](/blog/ea408dd75bc9b286dca5.png)

## The built-in browser

Remember that run script? To run it, press `Cmd + R`. My dev server boots up. You can open it in a regular browser like normal, or you can use Superconductor's **built-in browser**: click "Open Preview" and a browser pane opens right inside the app.

It's got some nice touches: a button to copy the URL, a button to open the site in your external browser, and a button to inspect.

![Built-in browser](/blog/e27bf9c2d6ad185f1f7c.png)

So now picture the full parallel setup. I start CourseShelf, press `Cmd + R`, open its preview. I do the same for my personal website. Two dev servers, two previews, both live at once. And on the left sidebar, any worktree with a running server gets a glowing blue dot, so at a glance I know exactly what's up without hunting through tabs.

![Running server](/blog/fb2c3ee5e15a731f548c.png)

This is the part that sold me. Parallel work across different projects, **and** parallel work inside the same project, each task fully isolated with its own deps, env, server, and preview.

## Workspaces and themes

The last feature, and honestly one of my favorites, is workspaces.

At the bottom left I keep one workspace for work and another for side projects. Want a new one? Create it (I made a "work number two" just to show it off). It feels a lot like Arc's spaces. Each workspace can even have its own theme. I gave one a deep, intense red. You set a chrome and accent color per workspace, so personal, work, and client contexts stay visually distinct and you always know where you are.

![Theme picker](/blog/ad7fdb09aa4c0e76a90a.png)

To jump between workspaces, press `Option + Cmd + Left`. And like everything else in this app, it's instant. The animations are flawless, with zero lag.

![New workspace](/blog/80b7d89ace8c145fbbc1.png)

## What I'm not using (yet)

Time for the honest part, because a review that's all praise is useless.

Superconductor has a bunch of heavier features I'm not touching. It can automatically review your changes, open pull requests for you, and there's a smart action button that walks through commit, push, PR creation, fixing CI, resolving conflicts, and merging, all without leaving the app. It tracks PR status per worktree too. It's clearly built for people who want to run a whole review-and-ship loop inside one window.

Me? I'm using the simple stuff: create projects, run agents in parallel, spin up worktrees with automated setup, run my dev servers, and switch between workspaces. That's all I need. But if you're a hardcore user, there's a lot of room to go deep.

A couple of caveats to set expectations:

- It's still in **alpha**. Things will change.
- I went looking for a pricing page and couldn't find one. As far as I can tell it's **free right now**, and I'd assume paid features show up eventually.
- The [documentation](https://super.engineering/docs/) is genuinely extensive if you want to dig into the advanced flows.

## Should you try it?

Yes. If you run more than one agent at a time, or you bounce between providers like I do, this is the cleanest setup I've found. It's fast, it's keyboard-driven, it's agent-agnostic, and the worktree automation alone saves me from a hundred tiny `npm install` papercuts a week. The fact that it's free and this polished while still in alpha is wild. Give it a shot and tell me what you think.

Thanks for reading all the way to the end, you're awesome. See you in the next one.

![That's all folks](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
