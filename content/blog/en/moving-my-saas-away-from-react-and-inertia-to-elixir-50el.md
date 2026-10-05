---
title: Moving my SAAS away from React (and Inertia) to Elixir
description: If you've been following my journey, you know I went all in on Elixir a while ago. I left the React...
publishedAt: 2026-06-02T18:22:23.532Z
updatedAt: 2026-09-03T14:27:36Z
tags:
  - react
  - elixir
  - inertia
  - javascript
videoId: DbBw1GAs-FQ
estudioSource: canais/en/videos/2026-05-30-moving-away-from-react
cover: /blog/53154af6c95faf3f1838.webp
socialImage: /blog/b719d1225aa0bc633ea5.png
---

If you've been following my journey, you know I went all in on Elixir a while ago. I left the React treadmill behind, picked Phoenix, and to keep React on the front end I used [Inertia.js](https://inertiajs.com/). For a year, I was happy. I built my SaaS, [CourseShelf](https://thecourseshelf.com/), and I had a lot of fun doing it.

And then I deleted all of it. 345 commits later, I have completely rebuilt CourseShelf from scratch, this time on full-stack Elixir with [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/welcome.html). No more React. No more Inertia. No more Node.js.

This is the story of why I did it.

[embed](https://www.youtube.com/watch?v=DbBw1GAs-FQ)

---

## The honeymoon was real (and then it ended)

I want to be fair to Inertia here, because Inertia is genuinely great. When I first adopted it, I was writing every line of code by hand, and the experience was wonderful. You get the productivity of Phoenix on the back end and you get React on the front end, glued together without a REST API in the middle. For someone coming from the React world, it felt like the best of both worlds.

But about six months ago I recorded a video with a title that probably gave away the ending: **"Do I regret picking Inertia over LiveView for my SaaS?"** And the honest answer was yes.

[embed](https://www.youtube.com/watch?v=0kZmG3sUu0U)

If you want the full side-by-side, that video does a proper comparison. But the TL;DR is simple: **LiveView is simpler.** Not just fewer layers of code, but fewer layers of *infrastructure*.

With Inertia, my React front end couldn't render itself on the server for free. To get good SEO, I needed server-side rendering, and to get server-side rendering I needed a pool of Node.js workers sitting next to my Elixir app, rendering React to HTML before sending it down. So I was maintaining two ecosystems instead of one. Elixir for the back end, and a whole Node.js runtime just to draw the first paint.

## The real killer: AI agents couldn't write Inertia code

Here's the thing that actually pushed me over the edge.

Inertia was a joy when I was hand-writing everything. But the moment I started moving toward agentic coding, the cracks appeared. Not a single AI agent out there could produce good Inertia code. I'd ask for a feature, and the agents would just keep spinning, generating code that didn't fit the pattern, didn't wire up correctly, didn't work.

And I realized: this is a ticking time bomb. Someday I'm going to sit down to build a feature, and I simply won't be able to, because the agents will choke and I'll be back to writing every layer by hand.

To be fully transparent, a lot of this wasn't Inertia's fault as a library. It was specifically the **[Inertia Phoenix port](https://github.com/inertiajs/inertia-phoenix)**. If you're a PHP/Laravel developer using Inertia, you have far more official support, more tooling, and the AI agents write much better code for you. You even get [Wayfinder](https://laravel.com/blog/laravel-wayfinder-end-to-end-type-safety-for-php-and-typescript) for end-to-end type safety between your backend and your frontend.

We don't have that in Elixir. For v1 of CourseShelf, I was creating the types of *everything* by hand. I literally had a `types/` folder, and every time I added a resource on the back end, I had to go write a matching TypeScript type on the front end. No code generation. Pure manual labor.

```typescript
// assets/js/types/course.ts  (CourseShelf v1)
export type Course = {
  id: number
  title: string
  slug: string
  url: string
  description: string | null
  thumbnailUrl: string | null
  difficultyLevel: DifficultyLevel
  status: CourseStatus
  estimatedDuration: number | null
  price: number | null
  insertedAt: string
  updatedAt: string
  // ...and on, and on, kept in sync by hand
  submittedBy?: User
  platform?: Platform
  channel?: Channel
  tags?: Tag[]
}
```

So: a paradigm the AI couldn't help me with, a port with second-class tooling, and a types folder I babysat by hand. I made the call to switch to full-stack Elixir.

---

## The new stack

The biggest change is the front-end layer, which I'll get to. But I also used the rebuild as an excuse to rip out an expensive piece of my infrastructure: [managed Postgres](https://fly.io/docs/mpg/) on [Fly.io](https://fly.io/), where I host everything.

Fly's managed Postgres is an amazing service. But it costs around **$38/month** for the first tier (one database plus a read replica), and I just don't have the scale to justify that. If you go to CourseShelf right now, you can count the accounts: I have 89. On a *great* day, when I tweet about it and get a traffic spike, I'll see around 130 users. On an average day it's more like 20. That is nowhere near enough to warrant a $40/month database.

![Expensive](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHhnZ2ZpaWRpN2lzenZiNHUwbnp3dmhvZHRnaGNyNjdsZDJpbWEydSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Q8JhKDsvVxPRS/giphy.gif)

So I switched to **unmanaged Postgres**, which runs me about **$7/month**. The catch with unmanaged is that I'm now responsible for my own backups, so I added [Tigris](https://www.tigrisdata.com/), another Fly.io service. It's S3-compatible (you literally use the AWS CLI to poke at it), and since I'm only storing tiny database backups, I'm paying essentially nothing for it.

And the front end, of course, is now LiveView.

## One file vs. three

Let me show you the thing I love showing in every video: how much simpler the front end gets.

In LiveView, you basically have **one layer**. One file defines your queries, your mutations, *and* your markup. Here's the actual course listing page from CourseShelf v2:

```elixir
# lib/course_shelf_web/live/course_live/index.ex
defmodule CourseShelfWeb.CourseLive.Index do
  use CourseShelfWeb, :live_view

  alias CourseShelf.Courses

  @page_size 15

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:page_title, gettext("Courses"))
     |> assign(:page_url, url(~p"/courses"))}
  end

  @impl true
  def handle_params(params, _uri, socket) do
    search = params |> Map.get("search", "") |> to_string()
    page = parse_page(params["page"])

    result =
      Courses.list_active_courses(page: page, page_size: @page_size, search: search)

    {:noreply,
     socket
     |> assign(:search, search)
     |> assign(:page, result.page)
     |> assign(:courses, result.entries)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <section id="courses-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <.course_card :for={course <- @courses} course={course} from={@current_url} />
    </section>
    """
  end
end
```

If you're new to Elixir, here's the quick tour:

- `mount/3` is your first render. Think of it as the `useEffect` that runs once. I'm just assigning some SEO stuff here.
- `handle_params/3` runs right after mount on this page. This is where I query all the courses and assign them to a `courses` variable.
- `render/1` draws the page, and it reaches into those variables through the `assigns` argument.

Inside the markup, notice `<.course_card ...>`. Unlike React, where a component is uppercase, here you call a component with **dot syntax**. The `:for={course <- @courses}` is LiveView's nice little syntactic sugar for a loop, and the `@` is sugar for "reach into `assigns` and grab this variable."

That's the whole thing. Query my courses, assign a variable, loop over it. One file.

Now let me show you what the *same* page looked like in Inertia.

First, I needed a controller. That's file number one:

```elixir
# lib/courseshelf_web/controllers/course_controller.ex  (v1)
conn
|> assign_prop(:courses, CourseJSON.serialize(courses))
|> assign_prop(:pagination, pagination)
|> assign_prop(:sort, sort_string)
|> render_inertia("courses/index")
```

See that `assign_prop(:courses, CourseJSON.serialize(courses))`? That `serialize` call is the problem. I **cannot** send an Elixir struct to a React front end. I have to convert it into a plain map first. So that's a whole separate module, file number two:

```elixir
# lib/courseshelf_web/controllers/course_json.ex  (v1)
defmodule CourseshelfWeb.CourseJSON do
  alias Courseshelf.Courses.Course

  def serialize(%Course{} = course) do
    %{
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail_url: course.thumbnail_url,
      difficulty_level: course.difficulty_level,
      # ...every single field, by hand
      tags: TagJSON.serialize(course.tags),
      channel: ChannelJSON.serialize(course.channel),
      platform: PlatformJSON.serialize(course.platform)
    }
  end

  def serialize(courses) when is_list(courses), do: Enum.map(courses, &serialize/1)
end
```

And *then*, finally, file number three: the React page that receives the props and renders them, with that hand-maintained TypeScript type from earlier sitting behind it.

```tsx
// assets/js/pages/courses/index.tsx  (v1)
export default function CoursesIndex({ courses, pagination, sort }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
```

So to render a course listing — the *easy* case — I'm navigating through a controller, a JSON serializer, and a TypeScript component. Three layers. And listing data is the simple part; mutations are a whole different beast.

This is why LiveView is absolute cinema for me. One file versus three.

![Perfection](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzZvc213djhzbHJjdnM5a201ODZ1djQzdmF4dDlpbDJ0bDloc2x3cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9WXyFIDv2PyBq/giphy.gif)

---

## The infrastructure bill nobody warned me about

The cost story isn't just the database. The most painful lesson was about *memory*.

I run the same size server for both v1 and v2: one machine, 1GB of RAM, 1 CPU. But here's the difference.

CourseShelf is a public website, so I need good SEO, which means I need server-side rendering. React is not a server-first framework, so to render it on the server I had to lean on that Node.js worker pool I mentioned. By default the Inertia Phoenix library spins up **four** Node.js workers. "Perfect," I thought, "I can server-render React, that's all I needed."

It's never that simple.

Each Node.js worker was eating about **150MB** of memory. Four of them is **600MB** — gone, just for rendering. Meanwhile Elixir's own baseline for a SaaS this size is around **200–300MB**. Out of a 1GB machine, I was constantly bumping against the ceiling. My memory usage hovered between **90% and 100%**, and my server would randomly fall over with out-of-memory crashes.

![Server on fire](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjBoamk2MnJmeTZpNDlvcmh6bzBqcTRrdGpyd2k3cHVnZWhjdmk2bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dbtDDSvWErdf2/giphy.gif)

The frustrating part? A year and a half ago, AI wasn't what it is today, and I didn't have the infra knowledge to debug it. I just knew my "performant Elixir app" kept crashing, and it made me furious. So I left it broken and ate the occasional crash.

Same machine today, with the JavaScript layer completely removed, my memory usage averages **250MB**. A quarter of what's available. The thing that used to run at 100% now idles at 25%.

| | v1 (Inertia) | v2 (LiveView) |
|---|---|---|
| Database | Managed Postgres, ~$38/mo | Unmanaged Postgres, ~$7/mo |
| Server | 1GB RAM / 1 CPU | 1GB RAM / 1 CPU |
| Front-end runtime | Elixir **+ 4 Node.js workers** | Elixir only |
| Avg memory usage | 90–100% (constant OOM crashes) | ~25% |

---

## "But you lose all the nice front-end stuff, right?"

This is the part everyone pushes back on. After I posted about the switch, the same questions kept coming up on Twitter, so let me answer them with real code from the new codebase.

### "You'll lose rich UI interactions."

Loading states? Load-more buttons? Drag and drop? All there.

For simple stuff — toggling a class, a transition, showing or hiding an element — Phoenix ships an entire module for it: [`Phoenix.LiveView.JS`](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.JS.html). You write what looks like an Elixir function right in your markup, and it runs entirely on the client with zero server round-trips:

```elixir
<button
  phx-click={
    JS.show(to: "#description-full")
    |> JS.hide(to: "#description-truncated")
    |> JS.show(to: "#show-less", display: "inline-flex")
    |> JS.hide(to: "#show-more")
  }
>
  Show more
</button>
```

And when you need *real* JavaScript — like drag-and-drop — you use **hooks**. The new thing I love here is **colocated hooks**: the JavaScript lives in the same file as the markup it controls. No separate hooks directory, no importing each file one by one.

For the playlist reordering on CourseShelf, I dropped the minified [SortableJS](https://sortablejs.github.io/Sortable/) library into `assets/vendor/`, exposed it on the window in my root `app.js`...

```javascript
// assets/js/app.js
import Sortable from "../vendor/sortable"
// Expose Sortable to colocated hooks (e.g. .PlaylistSort).
window.Sortable = Sortable
```

...and then wrote the hook right next to the grid it powers:

```elixir
# lib/course_shelf_web/live/playlist_live/show.ex
<div id="playlist-items-grid" phx-hook=".PlaylistSort" phx-update="stream" ...>
  <div :for={{dom_id, item} <- @streams.items} id={dom_id} data-item-id={item.id}>
    <.playlist_item item={item} ... />
  </div>
</div>

<script :type={Phoenix.LiveView.ColocatedHook} name=".PlaylistSort">
  export default {
    mounted() {
      this.sortable = window.Sortable.create(this.el, {
        handle: ".playlist-drag-handle",
        animation: 150,
        onEnd: (evt) => {
          if (evt.oldIndex === evt.newIndex) return
          const ids = Array.from(this.el.children)
            .map((child) => child.dataset.itemId)
            .filter(Boolean)
          this.pushEvent("reorder_items", { ids })
        }
      })
    },
    destroyed() {
      if (this.sortable) this.sortable.destroy()
    }
  }
</script>
```

Drag a card, drop it, and `pushEvent` tells the server the new order. Reload the page and it's persisted. Feels great.

### "Every page navigation is a full reload."

Nope. This is the most common misconception about LiveView. The whole goal of LiveView is to replicate the React feel as closely as possible.

Open your network tab and you'll see **one** WebSocket connection established on first load. After that, every page transition reuses that same socket — LiveView just patches the page, sends down the bits that changed, and renders them. No new HTTP request, no full reload.

The one caveat: when you cross between a public page and a private page, you *do* get a full refresh, because I'm tearing down the unauthenticated socket and opening an authenticated one. But navigating *within* the authenticated app — dashboard to settings and back — reuses the same socket. You pay the loading cost once, and everything after is instant.

### "Is AI actually good at LiveView?"

This is the one that matters most to me, given why I left in the first place. And the answer is yes — AI is *extremely* strong at writing LiveView.

The reason is that LiveView now ships with an `AGENTS.md` file packed with guidance on how to write proper Elixir, Phoenix, and LiveView code. The agents pick it up and the results are great out of the box. (I actually split mine into two files to save a bit on context, but the default already gets you most of the way.)

This is the exact opposite of my Inertia experience. There, the agents spun forever. Here, they ship.

### "I'll miss [shadcn/ui](https://ui.shadcn.com/)."

Worry not, my friend. The latest version of Phoenix uses [daisyUI](https://daisyui.com/) by default, with dark and light themes out of the box. I actually stripped out the light theme on CourseShelf to keep things simple, but you get it for free. My buttons, inputs, badges, and modals are all daisyUI tokens — `btn-primary`, `bg-base-200`, `text-base-content` — so I'm barely writing custom CSS anymore.

---

## Was it worth it?

The migration took me almost a month, and it was genuinely tiresome. 345 commits of rebuilding something that already worked is not most people's idea of fun.

But look at what I got: one front-end layer instead of three, a server that idles at 25% memory instead of crashing at 100%, a database bill cut from $38 to $7, one ecosystem to maintain instead of two, and — most importantly — a stack the AI agents actually understand. The ticking time bomb is defused.

The "perfect tech stack" doesn't exist. But the perfect stack *for me*, right now, building the kind of product I'm building, is full-stack Elixir and LiveView. If you went through a similar journey to mine, maybe it'll be yours too.

Go test the new [CourseShelf](https://thecourseshelf.com/) and let me know how it feels — does navigating between pages feel fast? Does the UI look good? I want every bit of feedback I can get.

And if you reached the end of this post, you're awesome. Thank you for your time.

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
