---
title: "Claude Fable 5 review: I let Anthropic's new \"bazooka\" loose on my SaaS"
description: "Claude Fable 5 just launched, and I did what any reasonable person would do: I woke up at 6 AM, got..."
publishedAt: 2026-06-10T19:50:21.090Z
updatedAt: 2026-09-03T14:27:34Z
tags: []
videoId: RHkFnFE6vgI
cover: /blog/70015d6c2d2eedb70c1e.webp
socialImage: /blog/5c223905a454fd1dc7d4.png
estudioSource: canais/en/videos/2026-06-10-claude-fable-5-is-here
---

Claude Fable 5 just launched, and I did what any reasonable person would do: I woke up at 6 AM, got flashbanged by an announcement page with no dark mode, read the whole thing, and then let the model loose on my production SaaS to see if the hype is real.

I recorded the whole experiment, including the exact moment Claude talked back to me for the first time ever. If you'd rather watch than read, here's the video:

[embed](https://youtu.be/RHkFnFE6vgI)

This post is the written version of that experiment: what the announcement actually says, the benchmark everyone should be paying attention to, the feature Fable 5 built in my codebase (with the real code it wrote), and my honest verdict at the end. If you only care about the verdict, feel free to scroll. I do the same thing.

## Fable vs Mythos: same model, different safeguards

The [announcement](https://www.anthropic.com/news/claude-fable-5-mythos-5) opens with a sentence that sets the tone: Fable 5 is a **Mythos-class model that Anthropic made safe for general use**. It's state of the art on nearly all tested benchmarks, and the longer and more complex the task, the larger its lead over previous models.

That matches the vibe on Twitter perfectly. People are describing Fable 5 as a **bazooka**: point it at a huge problem, like a giant migration or a feature that touches your whole codebase, and it will run for a very long time without hallucinating. But it's still a bazooka. If you need to change two files, it's probably overkill.

Now, releasing a model this capable comes with risks, so Anthropic shipped it with heavy safeguards. And I do mean *heavy*: from my own testing, if you dare to mention the word "security" or anything slightly adjacent to it, Fable 5 shuts down the party and your query gets rerouted to the next most capable model, Claude Opus 4.8.

![too dangerous](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmsxZ3VwcW00bWk0ZGx0cXRtbjJ6d2YzaHFrNWM1Nm1peDY0czF0YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eAnTGa1aWGErwsVpi5/giphy.gif)

This is also where the naming confusion comes from, so let me save you some scrolling on social media:

- **Claude Fable 5**: what we normies get. Full capabilities, with classifier-based safeguards on top (cybersecurity queries get rerouted, etc.).
- **Claude Mythos 5**: the *same underlying model* with safeguards lifted in some areas, available only to a small group of cyber defenders and infrastructure providers.

Same model. Different guardrails. That's it.

## The benchmark that actually matters: FrontierCode

Every announcement comes with the classic benchmark chart where the new model beats everything, and yes, Fable 5 wins everywhere. But there are two benchmarks worth zooming into.

The first is the classical SWE-bench Pro, which, let's be honest, some people say is outdated. Models have learned to ship slop code that still scores high on it.

The second is the interesting one: [**FrontierCode**](https://cognition.ai/blog/frontier-code), a new benchmark created by Cognition (the company behind Devin). Instead of only asking "does the code pass the tests?", it grades what real maintainers care about: would this PR actually get **merged**? They built it with 20+ open-source maintainers, and they grade behavioral correctness, regression safety, scope, test correctness, and code quality.

Here's how the hardest tier (the "Diamond" set) looked before Fable 5, straight from Cognition's post:

| Model | FrontierCode (Diamond) |
| --- | --- |
| **Claude Fable 5 (max effort)** | **~30%** (from Anthropic's chart) |
| Claude Opus 4.8 | 13.4% |
| GPT-5.5 | 6.3% |
| Gemini 3.1 Pro | 4.7% |
| Kimi K2.6 (best open-source) | 3.8% |

The previous king scored 13.4%. Fable 5, on max effort, scores **slightly more than 30%**. That is not an incremental jump, that's more than doubling the state of the art on the benchmark specifically designed to punish slop.

However (and this is a big however), take a look at the cost axis of that same chart. On **high** effort, Fable 5 already costs around **ten bucks per task**, which is roughly Opus 4.8 territory. Crank it to x-high or max effort and the sky is the limit. API pricing is **$10 per million input tokens and $50 per million output tokens**. Keep that in mind for later, because it shapes my entire recommendation.

Oh, and the announcement also casually mentions that Fable 5 beat **Pokémon FireRed using only vision**: just screenshots, no terminal access to the game. It also built a solar system simulator that **predicted a solar eclipse**. Cool party tricks, but let's test something that actually pays my bills.

## The catch nobody is talking about: you lose it on June 23

This is the part of the announcement I haven't seen anyone cover, and it's *very* important.

From June 9 through **June 22**, Fable 5 is included in the Pro, Max, Team, and Enterprise plans at no extra cost. On **June 23**, it gets removed from those plans, and using it will require **usage credits**. If capacity allows, they say they'll extend the included window.

Reading between the lines: Fable is expensive to run. Maybe they genuinely don't have the capacity to host this model for everyone. Or maybe they do, and they want to charge API pricing for it instead of including it in the subscriptions. To be honest? I think they're just money hungry, and what we're getting right now is essentially a free trial.

![expensive](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWE5bTc5Z2Z4Ym16czl5ZXd2aTRocW9yaGZrbmU5OHNsdGE2YmRzdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LScY2HbrHCICWKrUbO/giphy.gif)

So don't get too comfortable. You have about two weeks to fully test this thing. Which is exactly what I did next.

## Let's build a real feature in CourseShelf

Enough announcement reading. I opened the Claude desktop app with [CourseShelf](https://thecourseshelf.com/) (my SaaS, full-stack Elixir/Phoenix LiveView; you know the story if you've been following the channel), bumped the effort level from medium to **extra high** on the **1M context window**, and kept one eye on my five-hour usage limit, which started at 0%.

My prompt was deliberately vague, because I wanted to see how it thinks:

> I want to increase user engagement. Help me improve the app or build new features. What do you suggest we do? Give me a list.

After running for almost one minute, I got a list of genuinely good suggestions. The one I liked most was number nine, **profile badges / curator milestones**: cheap gamification that rewards *contribution* (writing reviews, adding courses) rather than just consumption. It even noticed I already had a course-milestone notification type in the codebase to build on. So: "I really liked suggestion number nine. Work on it."

Here's the timeline, because the token economics matter as much as the output:

- **~1 min in:** reading the codebase. Usage: 2%.
- **7 min in:** still running, 109 lines changed so far. Usage: 7%.
- **11 min in:** it's doing browser testing on its own, taking screenshots of the app with the preview to check its own work. Usage: 9%.
- **~12 min:** done. Usage: 9%.

Quick math: one small-ish feature ≈ 10% of my five-hour limit. So on extra-high effort I could ship roughly ten of these before hitting the wall. Reasonable, honestly.

## The moment Claude pushed back at me

I opened the app in my own browser to test. Profile pages now showed achievement badges (*Course Scout*, *Playlist Pro*, *First Finish*, *Seasoned Reviewer*) and they worked. But when I hovered over a badge, I got a question-mark cursor, and after a couple of seconds a native browser tooltip showed up: "Added 5 or more courses to the catalog."

So it had used the built-in `title` attribute instead of a frontend component. I appreciate using browser defaults, but I wasn't sure this was good UX. So I typed:

> I wonder if it would be better UX if we allowed users to click on the engagement metrics and open a modal that explains what the metric means, instead of just showing the built-in browser titles.

And then something happened that I have *never* seen from Claude before. It agreed with the problem, and then it **pushed back on my solution**:

> Honestly, the title tooltips have a real gap I should flag. They're desktop hover only. Mobile users and keyboard users get nothing. That said, I would tweak the shape of the fix: instead of one modal per badge, I would do one achievements modal for the whole system.

This is incredible. Previous versions of Claude Code would simply say "All right, I'm gonna ship that, no problem." Every older model was a robot with zero opinions: whatever you asked, it would do without question. That was literally my biggest complaint about them. I want a genuine pair programmer, someone with opinions and experience. **Fable 5 has opinions.** And its opinion was better than my idea. I said yes, obviously.

![talking to a robot](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnA4amUxd2I1M3l2YzVmODZ0cjNjbXBwczlpMTJmY2IzdWR0M3ZtcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cmyomj522Y87j4lBKO/giphy.gif)

Six minutes later (usage now 12%), the modal was built: badges became clickable, opening a single achievements modal that lists every tier with the locked ones dimmed, plus an info icon. Is the UI top-notch? Honestly, no. There's a bit too much information in that modal to absorb at a glance. Good, not great. But functionally, it nailed it.

## Sanity-checking the code

Before shipping anything an AI writes to production, I do a sanity check. This is the actual code Fable 5 wrote, straight from the commit.

It properly created a Phoenix context, and I love the design decision documented right in the code: badges are **computed on the fly from the canonical count queries**. No new table, so the badges can never drift from the real numbers:

```elixir
# lib/course_shelf/achievements.ex
defmodule CourseShelf.Achievements do
  @moduledoc """
  Derives profile achievement badges from a user's contribution counts.

  Badges are computed on the fly from the canonical count queries — no
  table backs them, so they can never drift from the real numbers and
  earning one requires no write path.
  """

  @tier_thresholds [
    courses_added: [1, 5, 25],
    reviews_written: [1, 10, 50],
    playlists_created: [1, 5, 15],
    courses_completed: [1, 10, 50]
  ]

  def progress(user_id) when is_integer(user_id) do
    Enum.map(@tier_thresholds, fn {category, thresholds} ->
      count = count_for(category, user_id)

      tiers =
        thresholds
        |> Enum.with_index(1)
        |> Enum.map(fn {threshold, tier} ->
          %{tier: tier, threshold: threshold, earned?: count >= threshold}
        end)

      %{category: category, count: count, tiers: tiers}
    end)
  end

  defp count_for(:courses_added, user_id),
    do: Courses.count_user_submitted_courses_by_id(user_id)

  defp count_for(:reviews_written, user_id),
    do: Reviews.count_user_reviews_by_id(user_id)

  # ... playlists_created and courses_completed follow the same pattern
end
```

On the frontend, it used pattern matching to map badge tiers to the different CSS variants, which is exactly how I'd write it:

```elixir
# lib/course_shelf_web/live/profile_live/show.ex
defp achievement_name(:courses_added, 1), do: gettext("Course Scout")
defp achievement_name(:courses_added, 2), do: gettext("Course Curator")
defp achievement_name(:courses_added, 3), do: gettext("Catalog Builder")
# ... same pattern for reviews, playlists, and completions

defp achievement_icon(:courses_added), do: "hero-squares-plus"
defp achievement_icon(:reviews_written), do: "hero-chat-bubble-left-right"

defp achievement_variant(1), do: "neutral"
defp achievement_variant(2), do: "primary"
defp achievement_variant(3), do: "warning"
```

And it wrote proper LiveView tests for the frontend, including the accessibility cases *it* brought up, not me:

```elixir
# test/course_shelf_web/live/profile_live/show_test.exs
test "renders the highest earned badge per category as a button that opens the modal",
     %{conn: conn} do
  target = user_fixture()
  review_fixture(user: target)
  library_fixture(user: target, status: :completed)

  {:ok, lv, _html} = live(conn, ~p"/profile/#{target.username}")

  assert has_element?(lv, "#profile-achievements")
  assert has_element?(lv, "button#achievement-reviews_written[phx-click]", "First Review")
  assert has_element?(lv, "button#achievement-courses_completed[phx-click]", "First Finish")
  refute has_element?(lv, "#achievement-playlists_created")
end
```

I told it "This looks great. Commit and push on main" (sorry, PR purists, it's my side project), opened a terminal, ran `git log`, and there it was: `feat: add achievement badges and explainer modal to profiles`. Very nice commit message, by the way. If you're wondering whether AI can write good Elixir in 2026: that argument is long dead.

## The token bill

Final tally: **~900 lines of code changed, 15% of my five-hour usage limit.** And here's the thing to internalize: the *one* round of feedback I gave took my usage from 9% to 15%. If you go back and forth with Fable 5 a few times on extra-high effort, your usage will evaporate.

So the economics are simple:

- If Fable 5 **one-shots** your feature: extra-high effort is fine. You can survive.
- If it **doesn't** one-shot it: you're going to burn a ton of tokens. Drop the effort to high or medium, or use a different model entirely.

And to be fair to Fable: this one *was* essentially a one-shot. The feature worked on the first try; the modal round was me nitpicking the UX, and Claude turned my nitpick into a better architecture than I asked for.

## Final verdict: 9/10

I rate Claude Fable 5 a solid **9/10**. It's a bazooka, and it's the best model available right now. And I say this having recently used Codex and some of the Chinese models via opencode: Fable 5 beats all of them by a wide margin. It's extremely thoughtful, it runs for a very long time without losing the plot, and for the first time ever it pushed back on my ideas and gave me something better.

But it is *extremely* token hungry. My honest recommendation for right now:

- **Don't make it your default model** for day-to-day work, unless your company has an infinite token budget (in which case, go wild).
- **Use Fable 5 to create plans, then let Opus execute them.** Best of both worlds at current prices.
- Remember the clock: it leaves the subscription plans on **June 23**. Test it while it's included.

My read on the industry: both Anthropic and OpenAI are shipping the best models they possibly can first, and optimizing for cost later. First we achieve AGI, *then* we make it cheap. I'd bet that in six months to a year we get a Fable 5.5 or 5.6 at the same level of performance for a fraction of the price. That's the moment this becomes everyone's default.

If you made it all the way down here, you're awesome, thank you for reading! Do you think Fable 5 is really the best model available, or is it just hype? Let me know in the comments. And if you skipped the video at the top, it's worth watching just for the moment Claude pushes back on me.

![thats all folks](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTV1ano1azh6NzZxNnhyNHFuaDFlZXM0cTV4dngwbWZ5MDRnZHhydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5IT69msgpaOcg/giphy.gif)
