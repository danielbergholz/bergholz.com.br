---
title: "Announcing CourseShelf: Rotten Tomatoes for Online Learning"
description: Back in 2019, I created TechSchool, an open-source platform to help people find free programming...
publishedAt: 2026-01-21T22:10:59.162Z
updatedAt: 2026-09-03T14:27:41Z
tags:
  - learning
  - beginners
  - elixir
  - react
cover: /blog/99db0a027ba7a414b285.webp
socialImage: /blog/5ec8c15644f6e362658e.png
devtoUrl: https://dev.to/danielbergholz/announcing-courseshelf-rotten-tomatoes-for-online-learning-4h3k
devtoId: 3189151
---

Back in 2019, I created [TechSchool](https://techschool.dev), an open-source platform to help people find free programming courses. The idea was simple: fight back against predatory coding bootcamps that charge thousands of dollars for content that's often worse than what's available for free on YouTube.

TechSchool worked. People found great courses. The community grew. But over time, I started noticing something.

## The limitations of TechSchool

TechSchool had two big problems:

**One**, it was limited to tech. My friend who wanted to learn guitar couldn't use it. My mom who wanted to learn cooking couldn't use it. The core idea of community-curated courses was valuable, but I was artificially limiting who could benefit from it.

**Two**, adding new courses required opening a Pull Request on GitHub. Great for developers, terrible for everyone else. Most people who want to learn don't know what Git is, and they shouldn't have to.

![Thinking hard](https://media.giphy.com/media/a5viI92PAF89q/giphy.gif)

I kept thinking: what if we could build something bigger? A place where anyone could discover quality courses in **any** subject, reviewed by real learners instead of marketing departments?

## Enter CourseShelf

CourseShelf is the spiritual successor to TechSchool. Think of it as **Rotten Tomatoes for online learning**.

Here's the core idea: when you're looking for a movie to watch, you check Rotten Tomatoes or IMDb. You trust the crowd more than the trailer. Why should finding a good course be any different?

Right now, if you want to learn something new, you either:

- Trust the platform's algorithm (which prioritizes engagement, not quality)
- Trust sponsored reviews (which are basically ads)
- Hope you get lucky

CourseShelf fixes this by letting real learners review and rate courses. No fake reviews. No sponsored content. Just honest opinions from people who actually completed the course.

Website: https://thecourseshelf.com

![Let's go](https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif)

## What you can do on CourseShelf

Here's a quick overview of the features:

- **Discover courses** across any subject, not just tech
- **Read and write reviews** with star ratings
- **Save courses to your library** to track what you want to learn
- **Create playlists** to curate learning paths for yourself or others
- **Follow other learners** to see what they're learning and recommending
- **Verify your channel** if you're a course creator on YouTube

Right now, the platform supports **YouTube courses** and **books**. We have plans to add support for other platforms like Coursera, Skillshare, and Domestika in the future.

## For course creators

If you're a content creator, CourseShelf has something special for you. You can verify your YouTube channel and get a **verified badge** on your profile. This helps learners identify official creators and gives you credibility.

Verified creators also get access to analytics: see how many people are viewing your courses, what they're saying in reviews, and how you compare to others in your category.

I created TechSchool because I was frustrated that my free courses had fewer views than paid garbage. CourseShelf is my attempt to fix the discoverability problem for all creators who are putting out quality content.

## The tech stack

I built CourseShelf using **Elixir and Phoenix** with **React and TypeScript** on the frontend via Inertia.js. If you've read my blog post about [leaving React for Rails and then Elixir](/en/blog/from-nextjs-to-rails-then-elixir-my-journey-through-reactjs-burnout-h8d), you know this is the stack I fell in love with.

Phoenix gives me the productivity of Rails with the performance and reliability of the Erlang VM. Inertia.js lets me use React without the complexity of building a separate API. It's the best of both worlds.

## Disclaimer

CourseShelf is currently in **beta**. We're actively adding features, fixing bugs, and improving the experience based on feedback. If you find something broken or have a suggestion, please let me know!

Some features are limited during beta, but the core experience of discovering and reviewing courses is fully functional.

## Join the community

I built TechSchool because I believe tech education should be accessible to everyone. I'm building CourseShelf because I believe **all** education should be accessible to everyone.

If you're a self-taught learner, a course creator, or just someone who's tired of wasting money on bad courses, give CourseShelf a try. And if you know a great course that deserves more attention, add it to the platform!

Let's build the largest community-curated database of online courses together. We are all gonna make it :fire:

![We're all gonna make it](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnptdm5uaHViY3p1cW1zdjcxeWNxZ3UwZXgxbmlpa2h1emdndTJsMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pHb82xtBPfqEg/giphy.gif)

## Follow us

Stay up to date with new features and announcements:

- Twitter: [@courseshelf](https://x.com/courseshelf)
- LinkedIn: [CourseShelf](https://www.linkedin.com/company/courseshelf)

## Thank you

If you reached the end of this post, thank you for your time. Building in public is scary, but seeing people use something I created makes it worth it.

Have questions? Want to chat? Find me on Twitter [@danielbergholz](https://twitter.com/danielbergholz) or drop me an email.

See you on CourseShelf!
