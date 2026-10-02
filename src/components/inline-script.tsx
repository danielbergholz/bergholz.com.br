"use client"

// A script that runs while the server HTML is parsed, before first paint.
// When React renders it on the client (switching locale swaps the root
// layout), it becomes inert `text/plain`: scripts never run there anyway, and
// an executable one makes React warn. A client component so `window` reflects
// where it renders; suppressHydrationWarning covers the `type` mismatch.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: callers pass static code with no user-controlled values
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
