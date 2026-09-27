import { type Locale, languageTags } from "./i18n.ts"

// Compact notation: en "15.8K" / "2.5M", pt-BR "15,8 mil" / "2,5 mi".
export function formatNumber(num: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(languageTags[locale], {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num)
}

// `currentYear` comes from getCurrentYear() (src/lib/current-year.ts): the year
// is dropped for dates in the current one, and reading the clock here would
// break prerendering.
export function readableDate(
  date: string,
  locale: Locale,
  currentYear: number
) {
  const parsedDate = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric"
  }

  if (parsedDate.getFullYear() !== currentYear) {
    options.year = "numeric"
  }

  // Pin the locale to the page's language so server and client format
  // identically; passing `undefined` uses each runtime's default and can
  // trigger a hydration mismatch for visitors whose browser locale differs.
  return parsedDate.toLocaleDateString(
    locale === "en" ? "en-US" : languageTags[locale],
    options
  )
}

// 977 -> "16:17", 3723 -> "1:02:03"
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// ISO-8601 video duration ("PT16M17S", "PT1H2M3S") -> seconds.
export function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (
    Number(match[1] || 0) * 3600 +
    Number(match[2] || 0) * 60 +
    Number(match[3] || 0)
  )
}
