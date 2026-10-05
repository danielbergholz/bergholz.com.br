---
title: "From Next.js to Rails then Elixir: My journey through React.js burnout"
description: I've been a web developer since 2019. I used React.js and React-based frameworks like Gatsby, Next,...
publishedAt: 2024-01-10T23:29:41.190Z
updatedAt: 2026-09-03T14:28:31Z
tags:
  - nextjs
  - rails
  - elixir
  - react
cover: /blog/0995dc67e1d928dabf00.webp
socialImage: /blog/adff9c040676cff0e6c1.png
---

I've been a web developer since 2019. I used React.js and React-based frameworks like Gatsby, Next, Remix, Astro, and Hydrogen. I've never been fully content with any of these tools, but, as a beginner who was deep into the JS ecosystem, all that I could hear from my peers was something along those lines: "This is the way, any other programming language is either slow or old".

![This is the way](https://media.giphy.com/media/stnjSj2vpLcM4rwmEH/giphy.gif)

As a result, I got used to a **huge** amount of complexity: Multiple separate repositories, thousands of libraries and frameworks to achieve simple things, GraphQL, microservices, serverless, static site generation, incremental static regeneration, partial hydration, redux, redux-thunk, babel, webpack, react server components, server actions, etc. This list could go on for another 10 minutes.

Until one day I said **ENOUGH IS ENOUGH!** Let's take a look at the complete timeline of me slowly going mad. This will take a while, feel free to make some coffee before the long read!

---

## The timeline of the burnout

### [Gatsby.js](https://www.gatsbyjs.com/)

I remember finishing my bootcamp and thinking: "Finally I'm able to build my portfolio!", and so I did. There was only one small problem, I wanted to index on Google, but using the good old `create-react-app` made this mission nearly impossible. Soon I learned about SEO and React's hydration cycle, which led me to the "solution" of this problem: Gatsby.js. The idea of static site generation was simply revolutionary for me back then, after all, nothing is faster than pre-rendered HTML files, right?

I decided to learn this new framework by reading the docs and let me tell you, this was **NOT** a fun experience. I have never heard of GraphQL before, and apparently, you needed it to generate all the static files (what the hell???). I asked some of my internet friends if having a hard time learning all of this overengineered crap was normal, and they replied with "Skill issue, try harder!". So I tried harder, and after finally learning it, I ported my personal website to Gatsby.

![Try harder](https://media.giphy.com/media/gzRiZROEyDCznPofKj/giphy.gif)

Most of my pages were successfully indexed on Google, and for a couple of months, I was extremely satisfied with the result. Then another problem appeared: A **LOT** of my developer friends started saying "Gatsby is dead! Next was created to simplify static site generation and also provide server-side rendering".

### [Next.js](https://nextjs.org/)

I took a quick glance over the Next documentation and **immediately** fell in love. I was able to do the same things as Gatsby without GraphQL and with a third of the code! Once again, I ported my portfolio to another framework: Next.

This time I truly had a wonderful experience. Deploying to Vercel was a breeze, the `getStaticProps` and `getServerSideProps` functions were simple, yet extremely powerful, I could choose the rendering style per page, a lot of flexibility in general.

Unfortunately, something I learned the hard way: In the JavaScript ecosystem, all the good things come to an end.

### [Remix](https://remix.run/)

I remember extremely well when Remix was announced. Multiple tech influencers started publishing content about it (as always). However, back then I read on the home page that it did not support static site generation, just server-side rendering, so I thought "Wait a sec, all those years investing on the [JAMstack](https://jamstack.org/) are thrown away here? No way, this framework ain't gonna last". However, to my surprise, not only did Remix survive, but it was [acquired by Shopify](https://shopify.engineering/remix-joins-shopify) and emerged as a prominent competitor to Next.

After a couple of months had passed, I decided to give it a try. And once again, I was surprised, the main motto of Remix is to use the web fundamentals, and not an overly complex caching system like Next. So the mental model I needed in my head when coding in Remix was 10 times simpler: No global state manager, just use the URL, fewer client-side states, move all that logic to the server, and use cookies, going full stack without a REST API in the middle is super easy, just move your database queries to the `loader` function.

### Leaving the Matrix

![Leaving the Matrix](https://media.giphy.com/media/11e0gEWxYoSYTK/giphy.gif)

Then, out of nowhere, the truth was presented to me, and I took the red pill. Multiple questions started emerging in my head: Isn't Remix just like all the other "old and boring" frameworks like Rails, Laravel, and Django? We have been doing fullstack web development with server-side rendering for decades, but the JavaScript mafia decided collectively that this approach was trash, and moving everything to the client was the future. Did the same mafia decide that Rails was right all along? And doing all those over-engineered monstrosities with JS frameworks was not the right move? I started questioning everything. This "new" way of doing web development was a lot simpler and faster.

### I'm DONE with Next and Vercel

I reached my tipping point with [Next.js app router](https://nextjs.org/docs/app). Here is a comprehensive list of everything wrong that Vercel is pushing to Next:

- What was once simple: The `getStaticProps` and `getServerSideProps` functions, now became complex and cumbersome. Currently, there is no specific place to add your API calls or database queries, you can write them wherever you want! We started mixing the business logic with UI once again, after making the same mistake with PHP multiple years ago. Do frontend developers not learn from the past? What happens if I delete a button? Does this break my user authentication flow because the database call was inside it? Your front end should be 100% trashable and replaceable. The competitive advantage you have against your competitors is the business logic, which should be completely isolated from the UI layer.

![Horrible Next.js code](/blog/643a161228ed1ef7cce3.png)

- Next is now server first. Which doesn't sound that bad right? After all, this solves the SEO issue and shows fresh content to the user immediately. The problem is that most of the existing Next codebases relied on client-side libraries, like Styled Components and a couple of global state managers. What does this mean? With breaking changes like this happening constantly, your app becomes legacy software in a couple of weeks instead of years. More time is spent to keep all dependencies up to date rather than doing what matters: Shipping features.

- Vercel hired multiple React core team members from Meta. This presents a serious conflict of interest because these engineers are now (allegedly) shipping features that are beneficial to Next instead of prioritizing the ones that could help all the React-based frameworks like Remix.

![Vercel is corrupting React](/blog/6ada4363f65a4150960f.png)

I couldn't take it anymore. I said to myself: You know what? I am tired of re-learning the same framework over and over again, and I completely disagree with this new paradigm.

Not surprisingly, other content creators were going through a similar situation:

[embed](https://youtu.be/zkCBSz353fc?si=z3-FDVgcB3xfp06h)

[embed](https://youtu.be/Zt8mO_Aqzw8?si=10fy1d-ZoB7t3Uc_)

---

## The Path to Enlightenment

TL;DR: I was extremely tired. After getting burned out from all the React tools, my journey for simpler web frameworks started. Here are the prerequisites I was looking for:

- Batteries included
- Convention over configuration
- Good developer experience
- Modern and performant frontend

My first instinct was to take a look at the top frameworks from the [Stack Overflow Survey 2023](https://survey.stackoverflow.co/2023/#section-most-popular-technologies-web-frameworks-and-technologies). Immediately I cut out from the list anything JS, C# and Java related. I never had any desire to learn the last two, they look ugly and verbose. So the remaining options were: Laravel (PHP), Django (Python), Rails (Ruby), and Phoenix (Elixir).

Python is a language that I used during my Network Engineering degree and I had a very pleasant experience. Django seemed to follow the convention over configuration philosophy, but what turned me down from it ultimately was not having a good built-in tool to work on the front end. Most people on forums said they were using [HTMX](https://htmx.org/) and [Alpine](https://alpinejs.dev/), however, both are external dependencies that you need to install.

Giving up on Laravel was extremely hard because it has an amazing cost benefit, with hundreds of official packages to handle pretty much anything a startup might need, like hosting, authentication, stripe payments, etc. For the front end, they created [inertia.js](https://inertiajs.com/), a very simple and elegant way of keeping the high productivity and powers from Laravel while using React on the front end. To be 100% honest here, the only reason I didn't choose Laravel was because of PHP's syntax, it looks ugly as hell with a bunch of `$` and `->` everywhere.

### Ruby on Rails

Ruby on Rails needs no introduction. It's the OG of web development frameworks, with the revolutionary "build a blog in 15 minutes", which is still impressive to this day. Before I start ranting about all of the problems I found, let's start with the good stuff.

Similar to Python, Ruby is that language that you can show to non-technical people and they will understand what the software is trying to do. It is **by far** the easiest to read and the most beautiful language I've ever seen. I quickly realized that [writing visually pleasing code](https://world.hey.com/dhh/a-writer-s-ruby-2050b634) was a priority for the Rails team, and that was new to me.

Not to mention that Rails pretty much invented the "Batteries included" and "Convention over configuration" philosophies, so this wouldn't be a problem. Inside one single documentation, everything I needed for any type of web application was available.

On the frontend side, there is [Hotwire](https://hotwired.dev/), a very simple and lightweight approach to all the UX improvements provided by SPA frameworks. I've always been curious to test the limits of this library, it looks very promising.

Alright, so on paper Rails passed on all of the prerequisites I wanted on a framework. Let's try it! The first thing I tested locally was the `rails scaffold` command. And immediatly I was **SHOCKED**. One single command generates everything I need for a CRUD? No way!

![Image description](/blog/16b8598f83e38184dfa3.png)

On Node + React land, to achieve the same thing, I would need to manually write all the code (there are no generators here) and install a bunch of libraries like: Vite, prisma, express, react router, redux, redux-thunk, vitest, cypress, react testing library, zod, typescript, eslint, prettier, 1000 different plugins, and maybe even GraphQL or tRPC. Basically a package.json with 900 dependencies already.

After the initial shock from `rails scaffold`, I was shocked once again when I opened the code from the controller:

```ruby
class ArticlesController < ApplicationController
  def index
    @articles = Article.all
  end

  def show
    @article = Article.find(params[:id])
  end

  def new
    @article = Article.new
  end

  def create
    @article = Article.new(article_params)

    if @article.save
      redirect_to @article
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @article = Article.find(params[:id])
  end

  def update
    @article = Article.find(params[:id])

    if @article.update(article_params)
      redirect_to @article
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @article = Article.find(params[:id])
    @article.destroy

    redirect_to root_path, status: :see_other
  end

  private
    def article_params
      params.require(:article).permit(:title, :body)
    end
end
```

Is this all of the backend code? Just a couple of lines? That's impossible! This is so simple that it looks like a "low code" tool. It's simple, elegant, and extremely readable, which is something we rarely find in the JS land.

Okay, okay, you must be thinking right now: "This crazy react dev from the internet said he ended up using Elixir, so there must be some things wrong with ruby!". And you are right my anonymous friend, there were some things that annoyed me quite a lot, let's talk about them.

First, we need to address the elephant in the room: Moving from React + Typescript to a dynamically typed language is not easy. From the moment I started writing code and no intellisense or dropdown filled with code suggestions show up on my VScode, I felt blind and lost. This is a terrible feeling, I could make a typo on a function name and didn't realize it until the website is in production! I know we can write tests, but this is the type of mistake that I want to identify immediatly on the IDE, and not during tests or deployment.

Another thing I thought I would like, but ended up hating it: Too much magic. Inside a Typescript codebase, I can click on top of any class or function, go to the source and see how it's implemented. On Rails, where the hell do I do validation (for example)? Do I create a private function inside the controller? Is there a especific folder for this? NOPE, the correct place to do it is inside the model. Why? Because that's how it works, you either adopt the convention or have a hard time writing ruby code. I simply cannot develop an "intuition" on how everything works under the hood, I have to blindly trust that the maintainers did a good job at organizing everything.

And to finish my frustrations, I started writing frontend code. How do I create components? [Partials](https://guides.rubyonrails.org/layouts_and_rendering.html#using-partials). How do I define the prop types of this component? There is no way to do that, you need to open it up and visually look for all the variables inside it. How about doing some interactivity? Creating states? Well, there is Hotwire with [Stimulus](https://stimulus.hotwired.dev/), but as you can see, you need to manually create your "re-render" function, it doesn't figure out a way to re-render the page automatically after changing a state like React.

```js
// src/controllers/slideshow_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "slide" ]

  initialize() {
    this.index = 0
    this.showCurrentSlide()
  }

  next() {
    this.index++
    this.showCurrentSlide()
  }

  previous() {
    this.index--
    this.showCurrentSlide()
  }

  showCurrentSlide() {
    this.slideTargets.forEach((element, index) => {
      element.hidden = index !== this.index
    })
  }
}
```

Once Again I got frustrated. I got reeeeeeeally close to finding the perfect framework! What is the next framework on my list that I wanted to try if Rails failed? Elixir.

### Elixir and Phoenix

I have to be honest, I was running low on patience. I tried multiple different ecosystems, and I was almost convinced to just stick with Ruby on Rails and give up on my quest to perfection. Until a video appeared on my YouTube recommended section:

[embed](https://www.youtube.com/live/bfrzGXM-Z88?si=Xsa7yCKeVSY5R3sT)

Hold on! Here we can see a React developer saying a bunch of nice things about functional programming, Elixir and Phoenix Live View. Maybe I should give it a try!

The first thing I did was open the documentation for Elixir and Phoenix, and I really enjoyed the fact that all packages are documented in the same way using [Hex Docs](https://hexdocs.pm/), you just need to get used to one interface in order to learn new things.

Another good thing is that you can truly learn Elixir just reading the docs, no need for an expensive course! On every other ecosystem, I had to learn the language through a paid course and then learn the framework by reading the docs.

Then it was time to start writing code. Very quickly I understood that functional programming is very different from OOP. Let's do a small comparison:

```js
// JS
const obj = {name: "daniel"}
obj.age = 25

// result: obj = {name: "daniel", age: 25}
```

```elixir
# Elixir
obj = %{name: "daniel"}
obj = Map.put(obj, :age, 25)

# result: obj = %{name: "daniel", age: 25}
```

Or you could achieve the same thing with a simpler syntax using the pipe operator:

```elixir
# Elixir with pipe operator
obj = %{name: "daniel"} |> Map.put(:age, 25)

# result: obj = %{name: "daniel", age: 25}
```

Initially you might find it less readable and more complex, but I promise that over time it makes sense! Well, at least for me it did. As a React developer, I got used to seeing multiple functions everywhere, even front end components are functions! Not to mention the fact that creating a class is sometimes viewed as a code smell by the JavaScript mafia. My brain was already "shaped" for this new paradigm, it just felt natural to me. Since my Network Engineering degree in university, I had several classes about object oriented programming, but it never "clicked". I couldn't model complex problems into classes and objects. Using multiple functions to "mutate" a variable over time is how I model things in my mind.

How about the main framework? Is Phoenix batteries included? Convention over configuration? **YES IT IS!** To be honest, the ecosystem is not at the same level as Rails, but it's 95% there. Unless you need an ultra-specific feature, Phoenix got you covered.

I was _almost_ sold on Elixir, 2 things were missing from my list: Good developer experience and modern/performant front end code.

José Valim announced he was experimenting with adding types to the language, but Elixir doesn't have them currently, so I got concerned. How do I get intellisense and autocomplete without types? Soon I discovered these features aren't necessarily related. After installing the [ElixirLS extension](https://marketplace.visualstudio.com/items?itemName=JakeBecker.elixir-ls) on VScode I was surprised. It's possible to define a function inside a random module on a random folder, import it somewhere else, and get the intellisense and documentation for it! I have those benefits from statically typed languages without the hassle of writing types, simply amazing!

[embed](https://elixir-lang.org/blog/2022/10/05/my-future-with-elixir-set-theoretic-types/)

My final concern on the frontend was addressed by Phoenix [Live View](https://hexdocs.pm/phoenix_live_view/welcome.html). On the code side, this was the exact piece of the documentation's home page that convinced me:

![Image description](/blog/6d4655bfdade3b0aebfb.png)

You can define "props" to every component, and if the types mismatch, you get an error in your IDE, just like react! Impressive!

How about the UX? Is there a full page load whenever a user clicks on a link? Hell no! Live view establishes a WebSocket connection with the client, and then every page transition is just a content swap made through the Websocket, no new HTTP request is made. Also, all of the state is managed on the server side, which means that rich user experiences like Trello, which used to be very janky on the client side due to an excessive amount of javascript being loaded, are now super fast! Elixir handles all the complex state logic and sends the updated pieces of the page to the front end. Take a look at the full explanation here:

[embed](https://youtu.be/wrmVk2czqMg?si=ZoWAlPjQC-svmV3Y)

Since we are using WebSockets for builing the UI, creating "live" applications like Twitter takes only a couple of lines of code!

[embed](https://youtu.be/MZvmYaFkNJI?si=gAow6oIjgf8_OTkg)

## Conclusion

It's safe to say that the "perfect tech stack" doesn't exist. The silver bullet that solves all the problems is an illusion that we create in our minds to keep searching and building the most optimized tool.

However, at an individual level, the perfect stack does exist. Because each developer has preferences, and you can easily find a tool that fits your criteria. If you had a similar journey to mine, perfection might be Elixir and Phoenix! So give it a try, maybe you'll love it as much as I do now.

If you reached the end of this blog post, you are awesome! Thank you so much for your time, and I hope I could bring some value into your career.

![The end](https://media.giphy.com/media/lD76yTC5zxZPG/giphy.gif)
