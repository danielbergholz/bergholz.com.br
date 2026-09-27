import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

const iconSizes = ["192x192", "512x512"]

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.name,
    description: site.description,
    lang: site.language,
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: site.themeColor,
    background_color: site.backgroundColor,
    icons: iconSizes.flatMap((sizes) => {
      const icon = {
        src: `/web-app-manifest-${sizes}.png`,
        sizes,
        type: "image/png"
      }
      return site.maskableIcons
        ? [
            { ...icon, purpose: "any" as const },
            { ...icon, purpose: "maskable" as const }
          ]
        : [icon]
    })
  }
}
