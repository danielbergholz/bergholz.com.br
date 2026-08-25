import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getDictionary } from "@/dictionaries"
import { getChannelStats } from "@/data-access/youtube"
import { defaultLocale, hasLocale, pageAlternates } from "@/lib/i18n"
import { formatNumber } from "@/lib/utils"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return {
    title: dict.meta.workWithMe.title,
    description: dict.meta.workWithMe.description,
    alternates: pageAlternates(locale, "/work-with-me"),
    keywords: [
      "Daniel Bergholz",
      "Business Consulting",
      "AI Consulting",
      "Technical Training",
      "Workshops",
      "AI Automation",
      "1-on-1 Mentorship",
      "Developer Mentorship",
      "AI Adoption",
      "Remote Work Abroad",
      "Content Creator",
      "Claude Code"
    ]
  }
}

const track = [
  {
    name: "Gearflow",
    key: "gearflow",
    url: "https://gearflow.com/"
  },
  {
    name: "Nebulab",
    key: "nebulab",
    url: "https://nebulab.com/"
  },
  {
    name: "CourseShelf",
    key: "courseshelf",
    url: "https://thecourseshelf.com/"
  },
  {
    name: "TechSchool",
    key: "techschool",
    url: "https://techschool.dev/"
  }
] as const

const stack = [
  "Elixir",
  "Phoenix",
  "React",
  "TypeScript",
  "Next.js",
  "PostgreSQL",
  "SQLite",
  "GraphQL",
  "Claude Code",
  "Cursor",
  "opencode",
  "OpenAI"
]

const comingSoonBadgeStyle =
  "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800"
const openBadgeStyle =
  "text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-800"

export default async function WorkWithMe({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const t = dict.workWithMe

  const { subscriberCount } = await getChannelStats()

  const services = [
    {
      ...t.services.business,
      badge: t.comingSoon,
      badgeColor: comingSoonBadgeStyle
    },
    {
      ...t.services.mentorship,
      badge: t.comingSoon,
      badgeColor: comingSoonBadgeStyle
    },
    {
      ...t.services.content,
      description: t.services.content.description.replace(
        "{subscribers}",
        formatNumber(subscriberCount, lang)
      ),
      badge: t.open,
      badgeColor: openBadgeStyle
    }
  ]

  const aiTooling = [t.ai.engineering, t.ai.automation, t.ai.agents]

  return (
    <main id="main" className="w-auto md:max-w-3xl mx-auto my-14 md:my-28">
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight mb-3">
        {t.title}
      </h1>
      <p className="text-sm md:text-base leading-relaxed opacity-60 mb-4">
        {t.intro}
      </p>
      <hr className="w-12 border-t border-current opacity-20 mb-6 md:mb-8" />

      <div className="space-y-5 md:space-y-6">
        {services.map((service) => (
          <div
            key={service.title}
            className="border border-current/10 dark:border-current/20 rounded-lg p-5 md:p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold">{service.title}</h2>
              <span
                className={`text-xs uppercase tracking-widest border rounded-sm px-2 py-0.5 ${service.badgeColor}`}
              >
                {service.badge}
              </span>
            </div>

            <p className="mb-4 leading-relaxed opacity-60 text-sm md:text-base">
              {service.description}
            </p>

            <ul className="list-disc list-inside space-y-1 opacity-60 text-sm">
              {service.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-10 md:mt-14">
        <h2 className="font-serif text-2xl md:text-3xl italic tracking-tight mb-4">
          {t.trackHeading}
        </h2>
        <hr className="w-12 border-t border-current opacity-20 mb-6" />

        <div className="space-y-4">
          {track.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col gap-0.5"
            >
              <span className="text-sm md:text-base font-bold group-hover:opacity-80 transition-opacity">
                {item.name}{" "}
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 opacity-60">
                  &rarr;
                </span>
              </span>
              <span className="text-sm opacity-60 group-hover:opacity-80 transition-opacity">
                {t.track[item.key]}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10 md:mt-14">
        <h2 className="font-serif text-2xl md:text-3xl italic tracking-tight mb-4">
          {t.aiHeading}
        </h2>
        <hr className="w-12 border-t border-current opacity-20 mb-6" />

        <div className="space-y-4">
          {aiTooling.map((item) => (
            <div key={item.title} className="flex flex-col gap-0.5">
              <span className="text-sm md:text-base font-bold">
                {item.title}
              </span>
              <span className="text-sm opacity-60">{item.description}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 mb-3 text-[10px] uppercase tracking-[0.2em] opacity-50">
          {t.stackHeading}
        </p>
        <div className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <span
              key={tech}
              className="text-xs uppercase tracking-widest border border-current/10 dark:border-current/20 rounded-sm px-3 py-1.5 opacity-60"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 md:mt-14">
        <hr className="w-12 border-t border-current opacity-20 mb-6" />
        <p className="text-sm md:text-base leading-relaxed opacity-60 mb-4">
          {t.outro}
        </p>
        <a
          className="group w-max text-xs md:text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity duration-300"
          href="mailto:daniel@bergholz.com.br"
          title={t.emailTitle}
        >
          daniel@bergholz.com.br{" "}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </a>
      </section>
    </main>
  )
}
