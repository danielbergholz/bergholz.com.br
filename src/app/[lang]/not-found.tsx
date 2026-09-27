import { NotFoundContent } from "@/components/not-found-content"
import { getLocale } from "@/lib/locale"

// Covers a notFound() thrown inside a page; unknown URLs get
// app/global-not-found.tsx instead.
export default async function NotFound() {
  return <NotFoundContent locale={await getLocale()} />
}
