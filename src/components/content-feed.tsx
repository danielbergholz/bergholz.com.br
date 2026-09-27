"use client"

import { useEffect, useId, useRef, useState } from "react"

import { ContentCard } from "@/components/content-card"
import type { Dictionary } from "@/dictionaries"
import type { Locale } from "@/lib/i18n"
import type { ContentItem } from "@/lib/types"

type Props = {
  items: ContentItem[]
  locale: Locale
  currentYear: number
  t: Dictionary["feed"]
  cardLabels: Dictionary["card"]
}

// How many of the newest items get the large full-width "featured" treatment
// (only in the default, unsearched view).
const FEATURED_COUNT = 4

function matches(item: ContentItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return item.title.toLowerCase().includes(q)
}

function SearchInput({
  value,
  onChange,
  onClear,
  t
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  t: Dictionary["feed"]
}) {
  const inputId = useId()

  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        {t.searchLabel}
      </label>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.34-4.34m0 0A7.5 7.5 0 1 0 6.06 6.06a7.5 7.5 0 0 0 10.6 10.6Z"
          />
        </svg>
      </span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchLabel}
        className="w-full rounded-lg border border-current/10 dark:border-current/20 bg-transparent pl-10 pr-10 py-2.5 text-sm md:text-base focus:border-current/30 dark:focus:border-current/40 transition-colors"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
          aria-label={t.clearSearch}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// The search query lives in ?q= so results can be shared, but it's read after
// mount and written with history.replaceState: reading it during render
// (useSearchParams) would opt the whole feed out of server rendering. The
// server-rendered list is the unfiltered one, so a ?q= link shows every item
// for a moment before the filter applies.
function readQuery() {
  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function writeQuery(value: string) {
  const url = new URL(window.location.href)
  if (value.trim()) {
    url.searchParams.set("q", value.trim())
  } else {
    url.searchParams.delete("q")
  }
  window.history.replaceState(window.history.state, "", url)
}

export function ContentFeed({
  items,
  locale,
  currentYear,
  t,
  cardLabels
}: Props) {
  const [inputValue, setInputValue] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsId = useId()

  useEffect(() => {
    setInputValue(readQuery())
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleChange = (value: string) => {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => writeQuery(value), 300)
  }

  const handleClear = () => {
    setInputValue("")
    if (debounceRef.current) clearTimeout(debounceRef.current)
    writeQuery("")
  }

  const isSearching = inputValue.trim().length > 0
  const filtered = isSearching
    ? items.filter((item) => matches(item, inputValue))
    : items

  const resultWord = (count: number) =>
    count === 1 ? t.resultSingular : t.resultPlural

  const resultSummary = isSearching
    ? filtered.length === 0
      ? `${t.noResultsFor} "${inputValue.trim()}"`
      : `${filtered.length} ${resultWord(filtered.length)} ${t.resultsFor} "${inputValue.trim()}"`
    : ""

  return (
    <div className="flex flex-col gap-5">
      <SearchInput
        value={inputValue}
        onChange={handleChange}
        onClear={handleClear}
        t={t}
      />

      <p
        id={resultsId}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {resultSummary}
      </p>

      {filtered.length === 0 ? (
        <p className="opacity-60 text-sm md:text-base" role="status">
          {t.noResultsFor} &ldquo;{inputValue.trim()}&rdquo;.
        </p>
      ) : isSearching ? (
        <>
          <p
            className="text-xs uppercase tracking-widest opacity-60"
            aria-hidden="true"
          >
            {filtered.length} {resultWord(filtered.length)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                locale={locale}
                currentYear={currentYear}
                t={cardLabels}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {filtered.slice(0, FEATURED_COUNT).map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                locale={locale}
                currentYear={currentYear}
                t={cardLabels}
                featured
              />
            ))}
          </div>
          {filtered.length > FEATURED_COUNT && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(FEATURED_COUNT).map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  currentYear={currentYear}
                  t={cardLabels}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
