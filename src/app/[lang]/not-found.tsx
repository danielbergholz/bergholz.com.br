import { lang } from "next/root-params"

import { NotFoundContent } from "@/components/not-found-content"
import { defaultLocale, hasLocale } from "@/lib/i18n"

// not-found boundaries receive no params, so the locale comes from the root
// [lang] segment through next/root-params.
export default async function NotFound() {
  const value = await lang()
  return <NotFoundContent locale={hasLocale(value) ? value : defaultLocale} />
}
