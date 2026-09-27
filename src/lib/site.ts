import type { SiteConfig } from "./site-config.ts"

// Site-wide settings (see site-config.ts): the single source of truth for the
// URL, names, colors and links used by metadata, JSON-LD, the manifest and the
// RSS feeds. Titles and descriptions here are the default (Portuguese) ones;
// pages take theirs from the dictionaries.
export const site: SiteConfig = {
  name: "Daniel Bergholz",
  title:
    "Daniel Bergholz - Engenheiro de Software, Criador de Conteúdo e Professor",
  description:
    "Daniel Bergholz é engenheiro de software, criador de conteúdo e professor. Ensina programação e ajuda empresas e devs a aproveitarem melhor a IA",
  url: "https://bergholz.com.br",
  language: "pt-BR",
  ogLocale: "pt_BR",
  author: { name: "Daniel Bergholz", url: "https://bergholz.com.br" },
  themeColor: "#ffffff",
  backgroundColor: "#ffffff",
  ogImage: {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Daniel Bergholz"
  },
  twitterHandle: "@danielbergholz",
  plausibleScriptId: "pa-9A0EgjEzmGVOQiIyE6Zqc",
  maskableIcons: false,
  socialLinks: [
    { name: "YouTube (EN)", href: "https://www.youtube.com/@DanielBergholz" },
    { name: "YouTube (BR)", href: "https://www.youtube.com/@DanielBergholzbr" },
    { name: "Instagram", href: "https://www.instagram.com/bergholz.dev/" },
    { name: "X", href: "https://twitter.com/danielbergholz" },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/daniel-gobbi-bergholz/"
    },
    { name: "GitHub", href: "https://github.com/danielbergholz" },
    { name: "DEV", href: "https://dev.to/danielbergholz" }
  ]
}
