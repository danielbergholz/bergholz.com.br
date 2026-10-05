---
title: How I Used AI to Rebuild My SaaS From Scratch
description: On my previous video, I explained why I migrated my SaaS, CourseShelf, away from React and Inertia to...
publishedAt: 2026-06-16T19:40:11.990Z
updatedAt: 2026-09-03T14:27:30Z
tags:
  - claude
  - elixir
  - react
  - ai
videoId: rjg_51HnTUI
estudioSource: canais/en/videos/2026-05-30-how-i-used-ai-to-rebuild-my-saas-from-scratch
cover: /blog/949f43b66cd1cff80a1d.webp
socialImage: /blog/9145f656534fe467f894.png
---

On my [previous video](https://www.youtube.com/watch?v=DbBw1GAs-FQ), I explained **why** I migrated my SaaS, [CourseShelf](https://thecourseshelf.com), away from React and Inertia to Phoenix LiveView. Today I want to talk about the part everyone actually asks me about: **how** I did it. Did I just point an AI at a giant codebase and walk away? Did I automate the whole thing?

Short answer: I tried. Four times. And the way it ended is not the way Twitter told me it would.

Let me give you the boring details first so nobody is confused. The model was primarily **Claude Opus 4.7**, and the harness was **Claude Code via the desktop app**. I've been playing around with OpenCode, the Codex desktop app, and people keep recommending the Pi coding agent — but for this specific migration, it was Claude Code, and I have a whole separate video coming about my setup. Not today. Today is about the four attempts.

[embed](https://www.youtube.com/watch?v=rjg_51HnTUI)

## Attempt 1: the lazy test

I have this thing I like to do from time to time that I call the **lazy test**. I try my absolute hardest to be the laziest person alive, give the AI the smallest possible prompt, and see what comes out. It's a great way to measure how much the models have improved. I still remember when I used to write two or three giant paragraphs of context just to get something usable. Now? Two or three lines and the model often nails it. So I was curious how far "nothing" would get me.

I'd heard people on Twitter saying you can do these crazy automations — "just tell Claude Code, 'hey, migrate Bun from Zig to Rust,' and it just works." Okay. Let me try the equivalent for my app.

The prompt was basically: *"please migrate this codebase away from React, use LiveView, make no mistakes."* And I didn't just use Opus 4.7 — I cranked it to **max effort**. Then I waited. And waited. A little under an hour. Like 40, 45 minutes.

The results were **horrendous**.

Now, to be fair, my effort level here was a hard **zero**. I spent ten seconds writing that prompt and maybe two brain cells crafting it. I was judging the output on two things: **UI fidelity** (does the new UI look like what I had live in production, or is Claude inventing random new components?) and **code quality** (is this clean and maintainable?).

On UI fidelity I gave it a **2 out of 10**. The funny part is the first ten minutes were genuinely good — I reviewed the homepage and it was very close to the React version. But every page after that looked like a completely different application. It felt like I'd asked Claude to build a brand new product from scratch instead of porting one frontend to another. It hallucinated components, random styles, the works.

And the code quality? When Claude actually wrote code, it was okay. But halfway through the task it announced *"I'm done, I finished the migration"* — and then I'd find a hundred to-do comments scattered around: *"this is pending, we'll fix it later, but for a v1 this is good enough."* On some pages there was literally a placeholder component rendered on the frontend that said **"this page isn't built yet, coming soon."**

Bro. NO. Unacceptable. First attempt: complete failure.

![garbage](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWJtajlkcTJqZnpqMnZhZWgwM3NpM3dsYmxpdHdteWc5YmVyYzN3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cKCKXWI2JtDcPaudGw/giphy.gif)

## Attempt 2: batching the work with sub-agents

Then I tried a skill that Boris introduced on Twitter, called `/batch`. The idea is that when you're facing one huge task, you batch it into smaller ones — instead of one main agent trying to do everything in a single marathon conversation, you explicitly tell Claude to spin up sub-agents, one per slice of work. One agent migrates the homepage, another does the blog page, another does the playlists page, and so on.

[embed](https://x.com/bcherny/status/2027534984534544489)

I genuinely thought this would help a lot, because attempt 1 taught me something important: **context rot is real**. The first few pages and components Claude migrated were great. But after minute twenty or thirty, it started hallucinating and going off-script. Batching attacks that directly — each agent has a short, focused context instead of one enormous degrading one.

And the results *were* better. Much better, honestly. My effort level was still zero — the only difference from attempt 1 was typing `/batch` at the start of the prompt. This time it took way longer before Claude started hallucinating, and I got around **two or three pages** that were genuinely good, both in LiveView code and in fidelity to the React version.

But Claude *still* pulled the same move: *"hey, we're done, the migration's finished,"* followed by to-do comments and "coming soon" badges on the frontend. Better, but not enough.

## Attempt 3: I stop being lazy

At this point I accepted the obvious: Claude does not have a crystal ball, and it cannot read my mind. I needed to be explicit. So I wrote a big markdown file with all the instructions I wanted it to follow, and I kept using the batch skill on top of it.

My effort level went from zero to about **four**. I spent 20–30 minutes crafting what I thought was the perfect plan, and I actually had to use some brain cells this time.

The biggest improvement here wasn't UI fidelity — it was **code quality**. Because Claude kept reusing conventions I had invented purely for the React/Inertia world, and porting them to LiveView where they made zero sense.

The clearest example: serializers. In Inertia you can't just query the database, grab an Elixir struct, and hand it to the frontend. You have to convert the struct into a plain map of props first. So in v1 I had a whole layer of `*JSON` modules doing exactly that. Here's a real one from the old codebase:

```elixir
# courseshelf-v1/lib/courseshelf_web/controllers/course_json.ex
defmodule CourseshelfWeb.CourseJSON do
  @moduledoc """
  Functions for serializing course resources
  """

  alias Courseshelf.Courses.Course
  alias Courseshelf.Utils
  alias CourseshelfWeb.ChannelJSON
  alias CourseshelfWeb.PlatformJSON
  alias CourseshelfWeb.TagJSON
  alias CourseshelfWeb.UserJSON

  def serialize(nil), do: nil
  def serialize(%Ecto.Association.NotLoaded{}), do: nil

  def serialize(%Course{} = course) do
    %{
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      view_count: Utils.format_number(course.view_count || 0),
      # ...a dozen more fields...

      # Relationships
      tags: TagJSON.serialize(course.tags),
      channel: ChannelJSON.serialize(course.channel),
      platform: PlatformJSON.serialize(course.platform),
      submitted_by: UserJSON.serialize(course.submitted_by)
    }
  end

  def serialize(courses) when is_list(courses) do
    Enum.map(courses, &serialize/1)
  end
end
```

And then the controller called that serializer for every single prop before handing it to React via Inertia:

```elixir
# courseshelf-v1/lib/courseshelf_web/controllers/course_controller.ex
conn
|> assign_prop(:courses, CourseJSON.serialize(courses))
|> assign_prop(:pagination, pagination)
|> assign_prop(:sort, sort_string)
|> assign_prop(:tab, "courses")
|> render_inertia("courses/index")
```

This middle layer only ever existed because of the React boundary. And Claude was faithfully recreating it in LiveView. I had to keep telling it: *"Claude, bro, just query the database and use the result on the frontend. There is no need for this middle layer."* In LiveView you assign the struct directly to the socket and render it — done.

For UI fidelity, I went a different route. I explicitly told Claude to use the [Playwright MCP](https://github.com/microsoft/playwright-mcp) to screenshot the live website, compare it to whatever it had just written in LiveView, and fix the discrepancies. And… I'm pretty sure Claude completely ignored that step. Same result as before: two or three pages that were extremely close to the original, and then everything else was new components invented from scratch, style guide ignored.

So attempt 3 was a good plan for code quality and still a bad result for UI fidelity. And after the third try, I was honestly starting to lose my patience and consider that maybe this wasn't going to be fully automated.

## Attempt 4: I stop automating and start driving

And ladies and gentlemen, that's exactly what I did.

I took that big markdown plan and converted it into a proper **skill**, then **manually invoked it, page by page**. I wanted to personally see every component and every page and confirm they were identical to the React version, with no code smells in the LiveView underneath.

People keep asking how big this skill is. It's not huge — **152 lines**, which I think is very reasonable. It encodes all the explicit decisions I didn't want Claude guessing at: what *not* to port, simplification rules, database schema parity, SEO parity, and a firm reminder to actually run the tests. Here's the simplification section, verbatim from the skill:

```markdown
<!-- courseshelf-v2/.claude/skills/migrate-v1-to-v2/SKILL.md -->
## Simplification rules

One purpose of the migration is to remove v1 complexity that existed only
because of Inertia/React boundaries.

Do not carry over these patterns unless there is a strong new reason:

- JSON serializer layers whose main job was converting structs to props
- Controller prop plumbing that only existed for Inertia
- React-only indirection, state workarounds, or hydration-oriented conventions
- Compatibility abstractions built around frontend constraints that no longer exist in LiveView

In v2, prefer:

- Calling context functions directly from LiveViews/controllers
- Assigning structs and maps directly
- Phoenix-native forms, routes, and state transitions
- Smaller, clearer modules over migration-era abstraction layers
```

That serializer rule is the same lesson from attempt 3, now written down once so I never have to repeat it in a prompt again. And here's what the v2 version actually looks like in practice — no serializer, the context function returns a `%Playlist{}` and it goes straight onto the socket:

```elixir
# courseshelf-v2/lib/course_shelf_web/live/playlist_live/show.ex
def mount(%{"username" => username, "slug" => slug}, _session, socket) do
  case Playlists.get_user_playlist_by_username_and_slug(
         socket.assigns.current_scope,
         username,
         slug
       ) do
    nil ->
      {:ok,
       socket
       |> put_flash(:error, gettext("Playlist not found"))
       |> push_navigate(to: ~p"/playlists")}

    %Playlist{} = playlist ->
      owner? = Playlists.playlist_owner?(socket.assigns.current_scope, playlist)
      socket = maybe_track_view(socket, playlist, owner?)

      {:ok,
       socket
       |> assign(:playlist, playlist)
       |> assign(:owner?, owner?)
       |> assign(:items_count, length(playlist.items))
       |> assign(:progress, Playlists.compute_progress(playlist.items))
       |> stream(:items, playlist.items)}
  end
end
```

The skill also makes the testing non-negotiable — it asks Claude to write LiveView tests and to run `mix precommit` before calling anything done, so we don't bypass the project's own rules.

Because I was manually calling this skill for every single major feature, my effort level jumped from a 4 to a solid **9 out of 10**. And I want to be precise about what that means: I did **not** automate the migration. I automated the *skill* — the playbook — but the actual work, I was driving by hand. Sure, AI wrote the code, but I was manually starting like five parallel Claude Code sessions, then reviewing each page and each diff myself.

The payoff: **UI fidelity went from a 6 to a 9**, and **code quality is a flat 10**.

| | Effort | UI fidelity | Code quality |
|---|---|---|---|
| Attempt 1 — pure lazy | 0 | 2 | to-do comments everywhere |
| Attempt 2 — `/batch` | 0 | a bit better | still "coming soon" badges |
| Attempt 3 — big markdown plan | 4 | still bad | much better |
| Attempt 4 — manual skill, page by page | 9 | 9 | 10 |

Why isn't fidelity a 10? Because under the hood, v2 uses [daisyUI](https://daisyui.com/) for Phoenix, and v1 used [shadcn/ui](https://ui.shadcn.com/) on the React side. If you've used my software before, you'll notice the buttons are slightly different, the dropdowns are slightly different. But I think that's completely acceptable — I'm deliberately using a different UI library, so some divergence is expected. It's not 100%, but it's about 90%.

## The code smell I had to teach away

Code quality being a 10 wasn't free either. Every time I caught a code smell from Claude, I'd stop and write *another* skill correcting it.

The best example is around LiveView interactions. LiveView has state, kind of like `useState` in React — except LiveView state can only change **on the server**. So every time you touch it, you're doing a round trip over the websocket. For some interactions, like simply opening and closing a dialog, Claude was using LiveView state. That means a user clicks "add to library," waits ~200ms for the server round trip, and *then* the dialog opens. That interaction shouldn't be slow — it's pure client-side UI. I'm not fetching anything, not validating anything, just opening a modal. That should never be backend state.

So I wrote a skill about it. The core principle is one question:

```markdown
<!-- courseshelf-v2/.claude/skills/liveview-interactions/SKILL.md -->
**The decision test:** *Would the server's response change what the user sees?*

- **No** → client-side. Use `Phoenix.LiveView.JS` commands directly from
  `phx-click`, or a colocated hook. No `handle_event`, no `:foo_open?` assign.
- **Yes** → server-side. `phx-click="event_name"` with a `handle_event/3` is correct.
```

The rule I gave Claude, in plain terms: only trigger a `handle_event` if you *absolutely* need the server — to fetch extra data, run validation, run a changeset. But if all you're doing is opening a dialog, use the JS module and push a client-side event instead. Here's the right pattern from the actual codebase — the edit button opens the modal instantly with `JS.show`, and a colocated hook prefills the form from `data-*` attributes, no server involved:

```elixir
# courseshelf-v2/lib/course_shelf_web/live/playlist_live/show.ex
<.button
  variant="secondary"
  type="button"
  id="playlist-show-edit"
  phx-hook=".PrefillEditPlaylistForm"
  data-playlist-name={@playlist.name}
  data-playlist-description={@playlist.description || ""}
  data-playlist-is-public={to_string(@playlist.is_public)}
  phx-click={
    JS.show(to: "#edit-playlist-modal", display: "flex")
    |> JS.focus(to: "#edit-playlist-name")
  }
>
  <.icon name="hero-pencil-square" class="size-4" />
  {gettext("Edit")}
</.button>
```

The server only gets involved when there's a real mutation to run. *Then* it does its thing and tells the client to close the modal — one `push_event` after the save succeeds:

```elixir
# courseshelf-v2/lib/course_shelf_web/live/profile_live/show.ex
def handle_event("save_profile", %{"user" => params}, socket) do
  case Accounts.update_profile(socket.assigns.current_scope, normalize_profile_params(params)) do
    {:ok, user} ->
      {:noreply,
       socket
       |> assign(:profile, user)
       |> assign_edit_form(user, true)
       |> push_event("edit-profile-modal:close", %{})
       |> put_flash(:success, gettext("Profile updated successfully"))}

    {:error, %Ecto.Changeset{} = changeset} ->
      {:noreply, assign(socket, :edit_form, to_form(changeset, as: :user))}
  end
end
```

After I wrote that skill, the results improved. But notice the loop: I had to *read* the code, *find* the smell, and *then* ask Claude to fix it. That's exactly why the effort level stayed at a 9.

## Was it worth it?

Here's the honest math. If I had been able to fully automate this with my lazy approach, I could probably have migrated the entire CourseShelf in **one night**. Instead, because I migrated every single thing by hand, the whole process took almost **two months** — call it 35 to 40 days. And remember, this is not my full-time job. CourseShelf is a side project, so 40 days of work *outside* my day job is a serious chunk of my life.

But because the code quality is a solid 10, I feel completely comfortable maintaining this codebase for the long run. In my humble opinion, this is the cleanest codebase I have ever worked with — I'm not joking, it might be the best software I've ever read. I don't want to shut this thing down because it's hot garbage. I'm genuinely proud of it.

So would I love to one day get a great result on the first lazy attempt? Absolutely. But I don't think we're there yet — not if you have high standards for code quality. The AI wrote almost every line of CourseShelf v2. It just needed me sitting right next to it, reviewing every page, writing a new skill every time it drifted. That's the part Twitter leaves out.

If you made it this far, you're awesome. I'll see you in the next one.

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
