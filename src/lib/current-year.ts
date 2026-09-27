import { cacheLife } from "next/cache"

// The current year, for copyright lines and "same year" date formatting.
// Cache Components rejects reading the clock during a prerender, so it's a
// cached function; a value up to a day old is fine.
export async function getCurrentYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}
