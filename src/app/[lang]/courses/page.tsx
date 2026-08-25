import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MembershipCTA } from "@/components/membership-cta"
import { Video } from "@/components/video"
import { getDictionary } from "@/dictionaries"
import { getCourses } from "@/data-access/youtube"
import {
  defaultLocale,
  hasLocale,
  localePath,
  pageAlternates
} from "@/lib/i18n"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)
  const t = dict.meta.courses

  return {
    title: t.title,
    description: t.description,
    alternates: pageAlternates(locale, "/courses"),
    openGraph: {
      type: "website",
      siteName: "Daniel Bergholz",
      title: t.title,
      url: localePath(locale, "/courses"),
      description: t.description,
      images: {
        url: "https://bergholz.com.br/og_courses.png",
        width: 1200,
        height: 630
      }
    },
    twitter: {
      site: "@danielbergholz",
      creator: "@danielbergholz",
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: {
        url: "https://bergholz.com.br/og_courses.png",
        width: 1200,
        height: 630
      }
    }
  }
}

export const revalidate = 86400 // 1 day

export default async function Courses({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.courses

  const { englishCourses, portugueseCourses } = await getCourses()

  // Lead with the courses in the reader's own language.
  const sections =
    lang === "pt"
      ? ([
          {
            id: "portuguese-courses-heading",
            heading: t.portugueseHeading,
            courses: portugueseCourses,
            language: "pt",
            empty: t.emptyPortuguese
          },
          {
            id: "english-courses-heading",
            heading: t.englishHeading,
            courses: englishCourses,
            language: "en",
            empty: t.emptyEnglish
          }
        ] as const)
      : ([
          {
            id: "english-courses-heading",
            heading: t.englishHeading,
            courses: englishCourses,
            language: "en",
            empty: t.emptyEnglish
          },
          {
            id: "portuguese-courses-heading",
            heading: t.portugueseHeading,
            courses: portugueseCourses,
            language: "pt",
            empty: t.emptyPortuguese
          }
        ] as const)

  return (
    <main
      id="main"
      className="my-14 md:my-28 max-w-[978px] mx-auto flex flex-col"
    >
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight mb-4">
        {t.title}
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-60 mb-4 max-w-2xl">
        {t.intro}
      </p>
      <hr className="w-12 border-t border-current opacity-20 mb-6 md:mb-8" />

      {sections.map((section, index) => (
        <section
          key={section.id}
          aria-labelledby={section.id}
          className={`flex flex-col gap-4 ${index > 0 ? "mt-10 md:mt-12" : ""}`}
        >
          <h2
            id={section.id}
            className="font-serif text-xl md:text-2xl italic tracking-tight"
          >
            {section.heading}
          </h2>
          {section.courses.length === 0 ? (
            <p className="opacity-60 text-sm md:text-base">{section.empty}</p>
          ) : section.language === "en" ? (
            <div className="flex flex-col items-center sm:items-stretch gap-4">
              {section.courses.map((playlist, courseIndex) => (
                <Video
                  video={playlist}
                  key={playlist.id}
                  newCourse={courseIndex === 0}
                  language="en"
                  t={dict.video}
                  featured
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center lg:justify-between">
              {section.courses.map((playlist) => (
                <Video
                  video={playlist}
                  key={playlist.id}
                  language="pt"
                  t={dict.video}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      <div className="mt-10 md:mt-14">
        <MembershipCTA t={dict.membership} />
      </div>
    </main>
  )
}
