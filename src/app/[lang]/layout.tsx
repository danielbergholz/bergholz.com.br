import type { Metadata } from "next"
import { Instrument_Serif, Poppins } from "next/font/google"
import Script from "next/script"

import { Footer } from "@/components/footer"
import { Nav } from "@/components/nav"
import { getDictionary } from "@/dictionaries"
import {
  defaultLocale,
  hasLocale,
  languageTags,
  localePath,
  locales,
  pageAlternates
} from "@/lib/i18n"
import "../globals.css"

const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif"
})

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return {
    metadataBase: new URL("https://bergholz.com.br"),
    alternates: pageAlternates(locale, "/"),
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    keywords: [
      "Daniel Bergholz",
      "Software Engineer",
      "Content Creator",
      "Solopreneur",
      "SaaS Products",
      "CourseShelf",
      "Programming",
      "Software Development",
      "React.js",
      "Next.js",
      "Elixir",
      "Phoenix",
      "Web Development",
      "JavaScript",
      "TypeScript"
    ],
    authors: [{ name: "Daniel Bergholz", url: "https://bergholz.com.br" }],
    creator: "Daniel Bergholz",
    publisher: "Daniel Bergholz",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    openGraph: {
      type: "website",
      siteName: "Daniel Bergholz",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      title: dict.meta.home.title,
      url: localePath(locale, "/"),
      description: dict.meta.home.ogDescription,
      images: {
        url: "https://bergholz.com.br/og.png",
        width: 1200,
        height: 630
      }
    },
    twitter: {
      site: "@danielbergholz",
      creator: "@danielbergholz",
      card: "summary_large_image",
      title: dict.meta.home.title,
      description: dict.meta.home.ogDescription,
      images: {
        url: "https://bergholz.com.br/og.png",
        width: 1200,
        height: 630
      }
    }
  }
}

// JSON-LD structured data for Person schema
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Daniel Bergholz",
  url: "https://bergholz.com.br",
  image: "https://bergholz.com.br/og.png",
  jobTitle: ["Software Engineer", "Content Creator", "Solopreneur"],
  description:
    "Software Engineer, Content Creator and Solopreneur from Brazil, building SaaS products while teaching programming to developers",
  nationality: "Brazilian",
  knowsAbout: [
    "Software Engineering",
    "Programming",
    "JavaScript",
    "TypeScript",
    "React.js",
    "Next.js",
    "Elixir",
    "Phoenix",
    "Node.js",
    "SaaS Development",
    "Content Creation",
    "Product Development"
  ],
  sameAs: [
    "https://www.youtube.com/@DanielBergholz",
    "https://www.youtube.com/@DanielBergholzbr",
    "https://www.instagram.com/bergholz.dev/",
    "https://twitter.com/danielbergholz",
    "https://www.linkedin.com/in/daniel-gobbi-bergholz/",
    "https://github.com/danielbergholz",
    "https://dev.to/danielbergholz"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "daniel@bergholz.com.br",
    contactType: "Personal"
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  const locale = hasLocale(lang) ? lang : defaultLocale
  const dict = await getDictionary(locale)

  return (
    <html lang={languageTags[locale]}>
      <head>
        {/* SEO Meta Tags */}
        <link rel="sitemap" href="/sitemap.xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#000000"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="color-scheme" content="light dark" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema)
          }}
        />

        {/* Analytics — next/script so client-side locale switches don't
            re-render a raw script tag React can't execute */}
        <Script
          defer
          data-domain="bergholz.com.br"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${poppins.className} ${instrumentSerif.variable} px-6 md:px-10 py-5 md:py-6`}
      >
        <a href="#main" className="skip-link">
          {dict.nav.skipLink}
        </a>
        <Nav locale={locale} t={dict.nav} />
        {children}
        <Footer locale={locale} t={dict.footer} nav={dict.nav} />
      </body>
    </html>
  )
}
