import Script from "next/script"

import { site } from "@/lib/site"

// Plausible, with the per-site snippet from Site settings → Site installation.
// The inline stub queues calls made before the script finishes loading.
const initScript =
  "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()"

export function Analytics() {
  return (
    <>
      <Script
        src={`https://plausible.io/js/${site.plausibleScriptId}.js`}
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {initScript}
      </Script>
    </>
  )
}
