"use client"

import { useEffect, useState } from "react"

import type { Dictionary } from "@/dictionaries"

type Theme = "system" | "light" | "dark"

const themes: Theme[] = ["system", "light", "dark"]
const storageKey = "theme"
const darkScheme = "(prefers-color-scheme: dark)"

function isTheme(value: string | null): value is Theme {
  return themes.some((theme) => theme === value)
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(darkScheme).matches)
  const resolvedTheme = isDark ? "dark" : "light"

  document.documentElement.dataset.theme = resolvedTheme
  document.documentElement.style.colorScheme = resolvedTheme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#000000" : "#ffffff")
}

type Props = {
  t: Dictionary["footer"]["theme"]
}

export function ThemeSwitcher({ t }: Props) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey)
      setTheme(isTheme(savedTheme) ? savedTheme : "system")
    } catch {
      setTheme("system")
    }
  }, [])

  useEffect(() => {
    if (theme === null) return

    applyTheme(theme)

    if (theme !== "system") return

    const media = window.matchMedia(darkScheme)
    const handleChange = () => applyTheme("system")
    media.addEventListener("change", handleChange)

    return () => media.removeEventListener("change", handleChange)
  }, [theme])

  const selectTheme = (nextTheme: Theme) => {
    applyTheme(nextTheme)
    setTheme(nextTheme)

    try {
      localStorage.setItem(storageKey, nextTheme)
    } catch {
      // The selection still applies for this visit when storage is blocked.
    }
  }

  return (
    <fieldset className="flex items-center gap-3">
      <legend className="sr-only">{t.label}</legend>
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-foreground/60"
        aria-hidden="true"
      >
        {t.label}
      </span>
      <div className="flex rounded-sm border border-current/15 p-0.5 dark:border-current/25">
        {themes.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => selectTheme(option)}
            aria-pressed={theme === option}
            className="cursor-pointer rounded-[1px] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {t[option]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
