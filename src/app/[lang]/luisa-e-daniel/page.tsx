import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { ExternalLink, Instagram, Play, YouTube } from "@/components/icons"
import { getLatestVeganVideo } from "@/data-access/youtube"
import { getDictionary } from "@/dictionaries"
import {
  defaultLocale,
  hasLocale,
  pageAlternates,
  siteUrl,
  type Locale
} from "@/lib/i18n"
import { readableDate } from "@/lib/utils"

const youtubeUrl = "https://www.youtube.com/@luisadanielbergholz"
const luisaInstagramUrl = "https://www.instagram.com/veg.luisasimei/"
const danielInstagramUrl = "https://www.instagram.com/bergholz.vegan/"
const partnerTracking =
  "utm_source=bergholz.com.br&utm_medium=referral&utm_campaign=cupons_luisa_bergholz"
const rakkauUrl = `https://www.rakkau.com.br/?${partnerTracking}`
const eatCleanUrl = `https://www.eatclean.com.br/?${partnerTracking}`
const luisaCouponCode = "LUISASIMEI"
const contactEmail = "contato@bergholz.com.br"

export const revalidate = 3600

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return {
    title: dict.meta.vegan.title,
    description: dict.meta.vegan.description,
    alternates: pageAlternates(locale, "/luisa-e-daniel"),
    openGraph: {
      title: dict.meta.vegan.title,
      description: dict.meta.vegan.description,
      url: `${siteUrl}${locale === defaultLocale ? "" : `/${locale}`}/luisa-e-daniel`,
      images: [
        {
          url: "/luisa-daniel.jpg",
          width: 1200,
          height: 1600,
          alt: dict.vegan.photoAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.vegan.title,
      description: dict.meta.vegan.description,
      images: ["/luisa-daniel.jpg"]
    }
  }
}

function ExternalCard({
  href,
  icon,
  title,
  description
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex min-h-24 items-center gap-4 rounded-lg border border-current/10 px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-current/30 dark:border-current/20 dark:hover:border-current/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-current/15">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <strong className="text-sm md:text-base">{title}</strong>
        <span className="text-xs opacity-60 md:text-sm">{description}</span>
      </span>
      <span className="text-xl transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
        &rarr;
      </span>
    </a>
  )
}

function CouponCard({
  brand,
  domain,
  href,
  offer,
  description,
  codeLabel
}: {
  brand: string
  domain: string
  href: string
  offer: string
  description: string
  codeLabel: string
}) {
  return (
    <article className="flex flex-col rounded-lg border border-current/10 p-6 dark:border-current/20 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="group"
        >
          <h3 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
            {brand}
            <ExternalLink className="opacity-40 transition-opacity group-hover:opacity-100" />
          </h3>
          <span className="mt-1 block text-xs opacity-50 transition-opacity group-hover:opacity-80 md:text-sm">
            {domain}
          </span>
        </a>
        <span className="rounded-full border border-current/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] md:text-xs">
          {offer}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed opacity-65 md:text-base">
        {description}
      </p>

      <div className="mt-6 rounded-md border border-dashed border-current/25 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">
          {codeLabel}
        </p>
        <code className="mt-1 block select-all font-sans text-xl font-bold tracking-[0.12em] md:text-2xl">
          {luisaCouponCode}
        </code>
      </div>
    </article>
  )
}

export default async function VeganPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  const [dict, latestVideo] = await Promise.all([
    getDictionary(lang),
    getLatestVeganVideo()
  ])
  const t = dict.vegan

  return (
    <main
      id="main"
      className="mx-auto my-14 flex max-w-5xl flex-col gap-14 md:my-28 md:gap-20"
    >
      <section className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg lg:min-h-[620px]">
          <Image
            src="/luisa-daniel.jpg"
            alt={t.photoAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 440px"
            className="object-cover object-[50%_46%]"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] opacity-50">
            {t.eyebrow} <span aria-hidden>🌱</span>
          </p>
          <h1 className="font-serif text-5xl italic leading-none tracking-tight sm:text-6xl lg:text-7xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed opacity-70 md:text-lg">
            {t.intro}
          </p>

          <nav aria-label={t.linksAria} className="mt-9 grid gap-3">
            <ExternalCard
              href={youtubeUrl}
              icon={<YouTube width={25} height={25} aria-hidden />}
              title={t.youtube}
              description={t.youtubeDescription}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ExternalCard
                href={luisaInstagramUrl}
                icon={<Instagram width={23} height={23} aria-hidden />}
                title={t.luisaInstagram}
                description="@veg.luisasimei"
              />
              <ExternalCard
                href={danielInstagramUrl}
                icon={<Instagram width={23} height={23} aria-hidden />}
                title={t.danielInstagram}
                description="@bergholz.vegan"
              />
            </div>
          </nav>
        </div>
      </section>

      {latestVideo && <LatestVideo video={latestVideo} locale={lang} t={t} />}

      <section aria-labelledby="coupons-title">
        <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">
          {t.coupons.eyebrow}
        </p>
        <div className="mt-3 max-w-2xl">
          <h2
            id="coupons-title"
            className="font-serif text-3xl italic md:text-4xl"
          >
            {t.coupons.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed opacity-60 md:text-base">
            {t.coupons.description}
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <CouponCard
            brand="Rakkau"
            domain="rakkau.com.br"
            href={rakkauUrl}
            offer={t.coupons.rakkauOffer}
            description={t.coupons.rakkauDescription}
            codeLabel={t.coupons.codeLabel}
          />
          <CouponCard
            brand="Eat Clean"
            domain="eatclean.com.br"
            href={eatCleanUrl}
            offer={t.coupons.eatCleanOffer}
            description={t.coupons.eatCleanDescription}
            codeLabel={t.coupons.codeLabel}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5 border-y border-current/10 py-8 sm:flex-row sm:items-center sm:justify-between dark:border-current/20">
        <div>
          <h2 className="font-serif text-2xl italic md:text-3xl">
            {t.contactTitle}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed opacity-60 md:text-base">
            {t.contactBody}
          </p>
          <p className="mt-3 select-all text-sm font-bold tracking-wide md:text-base">
            {contactEmail}
          </p>
        </div>
        <a
          href={`mailto:${contactEmail}`}
          className="w-max shrink-0 rounded-sm border border-current/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-current/60"
        >
          {t.sendEmail} &rarr;
        </a>
      </section>
    </main>
  )
}

function LatestVideo({
  video,
  locale,
  t
}: {
  video: NonNullable<Awaited<ReturnType<typeof getLatestVeganVideo>>>
  locale: Locale
  t: Awaited<ReturnType<typeof getDictionary>>["vegan"]
}) {
  const { snippet } = video
  const videoUrl = `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`
  const thumbnail =
    snippet.thumbnails.maxres?.url ??
    snippet.thumbnails.standard?.url ??
    snippet.thumbnails.medium.url

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.24em] opacity-50">
        {t.latestEyebrow}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl italic md:text-4xl">
          {t.latestTitle}
        </h2>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="hidden text-xs font-bold uppercase tracking-[0.14em] opacity-50 transition-opacity hover:opacity-100 sm:block"
        >
          {t.allVideos} &rarr;
        </a>
      </div>

      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="group mt-6 grid overflow-hidden rounded-lg border border-current/10 transition-colors hover:border-current/30 dark:border-current/20 dark:hover:border-current/40 md:grid-cols-[1.15fr_0.85fr]"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnail}
            alt={snippet.title}
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full border-2 border-white text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Play width={24} height={24} aria-hidden />
            </span>
          </span>
        </div>
        <div className="flex flex-col justify-center p-6 md:p-8">
          <time className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">
            {readableDate(snippet.publishedAt, locale)}
          </time>
          <h3 className="mt-3 text-xl font-bold leading-tight md:text-2xl">
            {snippet.title}
          </h3>
          <span className="mt-6 text-xs font-bold uppercase tracking-[0.16em] opacity-60">
            {t.watch} &rarr;
          </span>
        </div>
      </a>
    </section>
  )
}
