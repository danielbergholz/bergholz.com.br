import assert from "node:assert/strict"
import { test } from "node:test"
import {
  formatDuration,
  formatNumber,
  isYouTubeThumbnail,
  parseIsoDuration
} from "./utils.ts"

test("formatNumber abbreviates thousands and millions in English", () => {
  assert.equal(formatNumber(950), "950")
  assert.equal(formatNumber(15_800), "15.8K")
  assert.equal(formatNumber(883_000), "883K")
  assert.equal(formatNumber(1_000_000), "1M")
  assert.equal(formatNumber(2_500_000), "2.5M")
})

test("formatNumber abbreviates with Brazilian Portuguese notation", () => {
  // Intl separates the number and the "mil"/"mi" unit with a non-breaking space.
  const nbsp = " "
  assert.equal(formatNumber(950, "pt"), "950")
  assert.equal(formatNumber(15_800, "pt"), `15,8${nbsp}mil`)
  assert.equal(formatNumber(883_000, "pt"), `883${nbsp}mil`)
  assert.equal(formatNumber(1_000_000, "pt"), `1${nbsp}mi`)
  assert.equal(formatNumber(2_500_000, "pt"), `2,5${nbsp}mi`)
})

test("formatDuration formats mm:ss and h:mm:ss", () => {
  assert.equal(formatDuration(44), "0:44")
  assert.equal(formatDuration(977), "16:17")
  assert.equal(formatDuration(3723), "1:02:03")
  assert.equal(formatDuration(60), "1:00")
})

test("parseIsoDuration parses ISO-8601 durations", () => {
  assert.equal(parseIsoDuration("PT44S"), 44)
  assert.equal(parseIsoDuration("PT16M17S"), 977)
  assert.equal(parseIsoDuration("PT1H2M3S"), 3723)
  assert.equal(parseIsoDuration("PT3M"), 180)
  assert.equal(parseIsoDuration("PT2H"), 7200)
  assert.equal(parseIsoDuration("nonsense"), 0)
})

test("isYouTubeThumbnail only matches YouTube's image CDN", () => {
  assert.equal(
    isYouTubeThumbnail("https://i.ytimg.com/vi/abc/maxresdefault.jpg"),
    true
  )
  assert.equal(isYouTubeThumbnail("https://example.com/cover.png"), false)
  assert.equal(isYouTubeThumbnail("/luisa-daniel.jpg"), false)
  assert.equal(isYouTubeThumbnail(""), false)
})
