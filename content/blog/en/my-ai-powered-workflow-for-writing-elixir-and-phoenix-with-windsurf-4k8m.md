---
title: My AI-Powered Workflow for Writing Elixir and Phoenix with Windsurf
description: There's a ton of stuff out there about using AI to write JavaScript and Next.js code, but what about...
publishedAt: 2025-03-10T14:41:03.226Z
updatedAt: 2026-09-03T14:27:44Z
tags:
  - elixir
  - windsurf
  - ai
  - react
cover: /blog/0de308bbbc7cc2cf9d28.webp
socialImage: /blog/508592f5ec28a047d3e2.png
devtoUrl: https://dev.to/danielbergholz/my-ai-powered-workflow-for-writing-elixir-and-phoenix-with-windsurf-4k8m
devtoId: 2321033
---

There's a ton of stuff out there about using AI to write JavaScript and Next.js code, but what about Elixir and Phoenix? Are they getting left behind in the LLM code generation game? Well, yes and no. Can we make it better? Definitely. Is it worth the effort? Hell yeah. And can we actually become those legendary 10x engineers by writing Elixir with AI-powered tools like [Cursor](https://www.cursor.com) or [Windsurf](https://codeium.com/windsurf)? You bet we can!

## First, why Windsurf and not Cursor?

This year I tried using both Cursor and Windsurf for a month to see which one I'd stick with. The code they generated was pretty much the same (not surprising since they both use [Claude](https://claude.ai/) 3.5 Sonnet). But Windsurf was better at understanding my codebase and grabbing ideas from my existing files, plus its UI just felt smoother and more intuitive. Honestly though, these AI tools are copying each other's features so quickly that it probably doesn't matter which one you pick - they're both solid options.

![Image description](/blog/17779b14c152e07c5589.png)

## Does AI generate good Elixir and Phoenix code?

AI can handle the basics pretty well. Need a simple controller that renders a page? Or a basic [LiveView](https://hexdocs.pm/phoenix_live_view/welcome.html) with a bit of server-side state? Claude's got you covered.

But here's the thing - the more niche your tech stack gets, the less reliable AI becomes. Take my setup for example: I use Elixir, Phoenix, React, and [Inertia](https://inertiajs.com) for my side projects. The [Inertia adapter for Phoenix](https://hexdocs.pm/inertia/readme.html) is super new and not widely adopted yet (which is a shame - this combo is incredibly productive and performant). There's just no way current AI models have enough training data on this specific stack to generate useful code. The more specialized your tools, the more you'll need to rely on your own expertise rather than AI assistance.

This isn't just an Elixir thing - it's the same story with any tech that hasn't gone mainstream yet. Languages like Zig, Gleam, or Scala (and whatever frameworks people build with them) just don't have nearly as much code floating around online as JavaScript or Python do.

## How to improve?

I mainly use two features in Windsurf: [memories and rules](https://docs.codeium.com/windsurf/memories).

**Memories** are like Windsurf's personalized notepad. Did Claude mess up by using `assign/3` instead of `assign_prop/3` inside a controller to pass Elixir data to React? Just point out the mistake. If Windsurf thinks it's important, it'll remember this for your entire coding session and avoid repeating the error.

You can be direct about it too: "Hey, you got X wrong. The correct way is Y. Please create a memory for this."

**Rules** are more permanent and explicit. Just create a `.windsurfrules` file in your project's root directory with specific instructions (similar to how `.cursorrules` works). These rules will guide Windsurf every time it helps with your code.

Here is my current `.windsurfrules` for Phoenix + Inertia:

```md
You are an expert in Elixir, Phoenix, PostgreSQL, JavaScript, TypeScript, React, Inertia, and Tailwind CSS.

# Elixir and Phoenix Usage

- In controllers, use `assign_prop/3` to assign props to the Inertia page and then `render_inertia/2` to render Inertia pages.
- In controllers tests, use `inertia_component/1` to assert the component name and `inertia_props/1` to assert the props.
- When generating migrations, use `mix ecto.gen.migration <name>`
- Use plural form for context modules (e.g., "Users" for users table)
- Use singular form for schema modules (e.g., "User" for users table)
- Context files are usually inside a folder named after the resource (e.g., lib/my_app/users.ex)
- Schema files are usually inside a folder named after the resource (e.g., lib/my_app/users/user.ex)
- Prefer keyword-based queries over pipe-based queries
  - For example, use `from(u in User, where: u.age > 18, select: u)` over `User |> where(age: 18) |> select([u], u)`
- Use `dbg/1` to debug code.

# React and Inertia Usage

- Pages are in assets/js/pages. Use default export for pages.
- Components are in assets/js/components. Use named exports for components.
- Utils are in assets/js/lib.
- Inside pages, get the props from the controller as regular props from the function argument.
- When dealing with forms, use the `useForm` hook from Inertia
- Use absolute paths for local imports using `@/`
- If you need to merge tailwind classes, use the `cn` function from assets/js/lib/utils.ts.
- Import Radix components from "radix-ui", not from "@radix-ui/react-dialog" or "@radix-ui/react-button" etc.
- Always create the mobile version of the component along with the desktop version.
- Use lucide-react for icons.
- Use kebab-case for file names.
- If the page or component uses a type for a resource from the database, like users or courses, create the type in the assets/js/types folder.
- Prefer types over interfaces.

# General Usage

- When debugging data from the database, if the postgres_my_app MCP is not avaiable, use `psql my_app_dev -c "<your query>"` to connect to the database and then run the query. There is also the my_app_test database for testing.
- Use the `mix check` command after generating lots of files to check the Elixir and React code for errors and code quality. If you encounter format errors, use `mix format` to fix them.
- If any of my requests are not clear, ask me to clarify.
- If you have better suggestions, feel free to suggest them.

```

## Getting Up-to-Date Info

This is a super underrated feature when working with frameworks that change all the time (like Next.js) or more niche ones (like Phoenix). Remember: AI is great at general knowledge, but the more specific you go, the less likely it'll get things right. To fix this, just use the `@web` directive and drop in links to any documentation you think is relevant.

![Image description](/blog/141fbdbc779b10bdd32b.png)

## Sanity Check After a Long Coding Session

It's all fun and games when Claude spits out 20 new files and everything looks fine. But are you actually checking all these files for formatting issues, type errors, or compilation warnings? And how do you make sure your code quality isn't tanking over time? Sometimes AI misunderstands what you want and goes off on a tangent, potentially wrecking hours of your hard work.

That's why I made a simple script called "check" (my mental "sanity check") that I ask Claude to run after long coding sessions to make sure everything's still good.

```elixir
# mix.exs

defp aliases do
  [
    check: [
      "format --check-formatted",
      "cmd npm run typecheck --prefix assets",
      "deps.unlock --check-unused",
      "compile --warnings-as-errors",
      "credo --strict"
    ]
  ]
end
```

This script does a few key things: checks for formatting issues (my `.windsurfrules` file tells Claude to just run `mix format` to fix these), runs the "typecheck" script from my NPM project (React + Inertia) in the assets folder, looks for unused dependencies, checks for compilation warnings like unused variables or aliases, and finally runs [credo](https://hexdocs.pm/credo/overview.html) in strict mode to catch problems like oversized functions or deeply nested conditionals.

This way, you can sleep easy knowing your app not only works but also has solid code quality with no warnings or errors hanging around. This is just my version of the check command - feel free to create your own with checks that make sense for your project. And if you want Claude to run both the "check" script and your tests after generating code, just add that rule to your `.windsurfrules` file!

## A Word of Caution

This pro tip isn't specific to Elixir, but worth mentioning: be careful with generating code using AI - it can get expensive fast. Don't let the $15/month price tag fool you. This month alone I bought extra credits for Windsurf 3 times ($10 per 300 new credits). That brought my monthly cost to $45!

![burning money](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXl3YzZpMXRvdjlqZnV0Y2oxNnBiY3JyeDM5cGQ1bWR0MHRzbG5qaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Kerg053G7ZJUQ/giphy.gif)

How to avoid this? My rule is simple: only ask Claude to generate code once I'm really confident about what I want to build. If you have a clear PRD (Product Requirements Document), there's a 95% chance Claude will "one shot" the solution. This is way better than going back and forth, generating code, rejecting it, and generating again.

TL;DR: Spend more time planning rather than generating code. In this new era, code has become a "low level thing" that machines generate, while we humans can focus on higher level problems like crafting a good plan for an MVP, figuring out what users actually want, achieving product-market fit for our startup, etc.

## Moral of the story

Look, AI definitely has some blind spots with Elixir and Phoenix code - but as I've shown throughout this post, there are some pretty simple workarounds for most of these issues.

From my experience, the productivity boost is totally worth dealing with these little hiccups. That mythical "10x engineer" everyone talks about? It's not just hype - anyone can get there if they're willing to embrace these new tools.

The real trick is keeping an open mind and constantly trying new stuff. Don't get stuck doing things the old way just because that's how you've always done it.
