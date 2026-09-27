import { lang } from "next/root-params"

import { defaultLocale, hasLocale, type Locale } from "./i18n.ts"

// The locale of the current request, from the root [lang] segment. For Server
// Components, layouts and generateMetadata — i18n.ts stays free of Next.js
// imports because the proxy and client components use it too.
export async function getLocale(): Promise<Locale> {
  const value = await lang()
  return hasLocale(value) ? value : defaultLocale
}
