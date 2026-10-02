import { Instrument_Serif, Poppins } from "next/font/google"

import { Analytics } from "@/components/analytics"
import { Footer } from "@/components/footer"
import { InlineScript } from "@/components/inline-script"
import { JsonLd } from "@/components/json-ld"
import { Nav } from "@/components/nav"
import { getDictionary } from "@/dictionaries"
import { type Locale, languageTags } from "@/lib/i18n"
import { site } from "@/lib/site"
import "@/app/globals.css"

// The whole HTML document around a page: <head> (theme, JSON-LD, analytics),
// fonts, nav and footer. Shared by the [lang] root layout and
// app/global-not-found.tsx, which renders outside any layout.

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;var v=d?"dark":"light";r.dataset.theme=v;r.style.colorScheme=v;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?"#000000":"#ffffff"}catch(e){}})()`

const poppins = Poppins({ weight: ["400", "700"], subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif"
})

// JSON-LD structured data for Person schema
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.author.name,
  url: site.url,
  image: `${site.url}${site.ogImage.url}`,
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
  sameAs: site.socialLinks.map((link) => link.href),
  contactPoint: {
    "@type": "ContactPoint",
    email: "daniel@bergholz.com.br",
    contactType: "Personal"
  }
}

export async function SiteDocument({
  locale,
  children
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const dict = await getDictionary(locale)

  return (
    <html lang={languageTags[locale]} suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: this is the App Router root document (layout and global-not-found), not a Pages Router page */}
      <head>
        {/* SEO Meta Tags */}
        <link rel="sitemap" href="/sitemap.xml" />
        {/* No <meta name="viewport"> here: Next.js always emits one (alongside
            charset), so a manual one only renders the tag twice. */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        <InlineScript html={themeScript} />

        {/* Structured Data */}
        <JsonLd data={personSchema} />

        <Analytics />
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
