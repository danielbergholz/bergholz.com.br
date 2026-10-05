"use client"

import Script from "next/script"

type TwitterWidgets = { widgets?: { load: () => void } }

// Upgrades the article's <blockquote class="twitter-tweet"> placeholders with
// X's widgets.js, which sizes each iframe to its post. Rendered only on
// articles that embed a post. onReady also runs when a client navigation
// mounts it again after the script has loaded, so new placeholders get
// picked up too.
export function TweetEmbeds() {
  return (
    <Script
      src="https://platform.twitter.com/widgets.js"
      strategy="lazyOnload"
      onReady={() => {
        const theme = document.documentElement.dataset.theme
        for (const quote of document.querySelectorAll<HTMLElement>(
          "blockquote.twitter-tweet"
        )) {
          if (theme) quote.dataset.theme = theme
        }
        ;(window as { twttr?: TwitterWidgets }).twttr?.widgets?.load()
      }}
    />
  )
}
