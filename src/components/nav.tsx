"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState } from "react"

import type { Dictionary } from "@/dictionaries"
import {
  type Locale,
  languageTags,
  localePath,
  locales,
  stripLocalePrefix
} from "@/lib/i18n"

// Label for switching TO a locale, written in that locale's own language (the
// W3C pattern for language switchers — the reader who needs it may not speak
// the page's language). Rendered with a matching lang attribute so assistive
// tech pronounces it correctly. Keyed by target, so it lives here instead of
// the per-page dictionaries.
const switchLocaleLabels: Record<Locale, string> = {
  pt: "Mudar para português",
  en: "Switch to English"
}

const internalLinkBase =
  "text-sm normal-case tracking-normal font-medium transition-colors"

type Props = {
  locale: Locale
  t: Dictionary["nav"]
}

export function Nav({ locale, t }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const navLinks = [
    { href: localePath(locale, "/videos"), label: t.videos, prefetch: true },
    { href: localePath(locale, "/courses"), label: t.courses, prefetch: true },
    { href: localePath(locale, "/products"), label: t.products },
    { href: localePath(locale, "/work-with-me"), label: t.workWithMe }
  ]

  const homeHref = localePath(locale, "/")

  const isActive = (path: string) => pathname === path

  const linkStyle = (path: string) => {
    if (isActive(path)) {
      return `${internalLinkBase} text-foreground underline underline-offset-4 decoration-current/50`
    }
    return `${internalLinkBase} text-foreground/60 hover:text-foreground`
  }

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])

  const toggleMenu = () => setIsMenuOpen((open) => !open)

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu()
        toggleRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen, closeMenu])

  // Same page in the other locale: strip the current prefix, apply the target's.
  const basePath = stripLocalePrefix(pathname ?? "/")

  const localeSwitcher = (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
      {locales.map((target, index) => (
        <span key={target} className="flex items-center gap-2">
          {index > 0 && (
            <span className="opacity-30" aria-hidden="true">
              /
            </span>
          )}
          {target === locale ? (
            <span className="font-bold">{target.toUpperCase()}</span>
          ) : (
            <Link
              href={localePath(target, basePath)}
              lang={languageTags[target]}
              onClick={(event) => {
                closeMenu()
                // Carry the current query string (e.g. an active ?q= search)
                // across the locale switch. Read at click time because
                // useSearchParams here would opt the nav out of the
                // prerendered HTML. Plain left clicks only, so cmd/ctrl-click
                // keeps its open-in-new-tab behavior.
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return
                }
                event.preventDefault()
                router.push(
                  localePath(target, basePath) + window.location.search
                )
              }}
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label={switchLocaleLabels[target]}
            >
              {target.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <nav
      className="relative pb-5 border-b border-current/10 dark:border-current/20"
      aria-label="Main"
    >
      <div className="flex justify-between items-center gap-4">
        <Link
          href={homeHref}
          className="font-bold text-lg md:text-xl tracking-[0.15em] shrink-0"
          onClick={closeMenu}
          aria-current={pathname === homeHref ? "page" : undefined}
        >
          BERGHOLZ
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map(({ href, label, prefetch }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={linkStyle(href)}
                  prefetch={prefetch}
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="h-5 w-px bg-current/15 dark:bg-current/25 shrink-0"
            aria-hidden="true"
          />

          {localeSwitcher}
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 -mr-2 space-y-1.5 cursor-pointer"
          aria-label={isMenuOpen ? t.closeMenu : t.openMenu}
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
        >
          <span
            className={`block w-5 h-[1px] bg-current transition-all duration-300 motion-reduce:transition-none ${
              isMenuOpen ? "rotate-45 translate-y-[4px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1px] bg-current transition-all duration-300 motion-reduce:transition-none ${
              isMenuOpen ? "-rotate-45 -translate-y-[4px]" : ""
            }`}
          />
        </button>
      </div>

      {isMenuOpen && (
        <>
          <button
            type="button"
            aria-label={t.closeMenu}
            className="md:hidden fixed inset-0 bg-black/40 dark:bg-black/60 z-40 cursor-default"
            onClick={closeMenu}
            tabIndex={-1}
          />
          <div
            ref={menuRef}
            id={menuId}
            className="md:hidden fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] bottom-0 bg-white dark:bg-black border-b border-current/10 dark:border-current/20 py-6 z-50 overflow-y-auto"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))"
            }}
          >
            <div className="flex flex-col gap-6 px-6 md:px-10">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {t.pages}
                </p>
                <ul className="flex flex-col gap-3">
                  {navLinks.map(({ href, label, prefetch }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`block py-1 ${linkStyle(href)}`}
                        onClick={closeMenu}
                        prefetch={prefetch}
                        aria-current={isActive(href) ? "page" : undefined}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-current/10 dark:border-current/20 pt-6">
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                  {t.language}
                </p>
                {localeSwitcher}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
