import type { Metadata } from "next"
import Image from "next/image"

import { getDictionary } from "@/dictionaries"
import { getLocale } from "@/lib/locale"
import { localizedMetadata } from "@/lib/localized-metadata"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const dict = await getDictionary(locale)

  return localizedMetadata(locale, "/products", {
    ...dict.meta.products,
    keywords: [
      "Daniel Bergholz",
      "Projects",
      "CourseShelf",
      "TechSchool",
      "Free Education",
      "Developer Tools",
      "Open Source"
    ]
  })
}

export default async function Products() {
  const lang = await getLocale()
  const dict = await getDictionary(lang)
  const t = dict.products

  const products = [
    {
      name: "CourseShelf",
      url: "https://thecourseshelf.com/",
      logo: "/courseshelf-logo.svg",
      badgeStyle:
        "text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-800",
      ...t.courseshelf
    },
    {
      name: "TechSchool",
      url: "https://techschool.dev/",
      logo: "/techschool-logo.svg",
      badgeStyle:
        "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
      ...t.techschool
    }
  ]

  return (
    <main id="main" className="w-auto md:max-w-3xl mx-auto my-14 md:my-28">
      <h1 className="font-serif text-3xl md:text-4xl italic tracking-tight mb-4">
        {t.title}
      </h1>
      <hr className="w-12 border-t border-current opacity-20 mb-6 md:mb-8" />

      <div className="space-y-5 md:space-y-6">
        {products.map((product) => (
          <a
            key={product.name}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-current/10 dark:border-current/20 rounded-lg p-5 md:p-6 hover:border-current/30 dark:hover:border-current/40 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={product.logo}
                  alt={`${product.name} logo`}
                  width={36}
                  height={36}
                  className="w-8 h-8 md:w-9 md:h-9 object-contain flex-shrink-0"
                />
                <h2 className="text-lg md:text-xl font-bold group-hover:opacity-80 transition-opacity">
                  {product.name}
                </h2>
              </div>
              <span
                className={`text-xs uppercase tracking-widest border rounded-sm px-2 py-0.5 ${product.badgeStyle}`}
              >
                {product.badge}
              </span>
            </div>

            <p className="mb-4 leading-relaxed opacity-60 text-sm md:text-base">
              {product.description}
            </p>

            <div>
              <h3 className="text-sm font-semibold mb-2 tracking-wide">
                {product.offersHeading}
              </h3>
              <ul className="list-disc list-inside space-y-1 opacity-60 text-sm">
                {product.offers.map((offer) => (
                  <li key={offer}>{offer}</li>
                ))}
              </ul>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
