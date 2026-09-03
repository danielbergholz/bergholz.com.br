// Expire the site's cached dev.to data right now instead of waiting for the
// hourly ISR window. Run after publishing or editing a post on dev.to:
//
//   npm run revalidate
//
// Reads REVALIDATE_SECRET from .env (the same value set on Vercel). Point it
// at another deployment with REVALIDATE_TARGET=https://... (e.g. a preview).
const target = process.env.REVALIDATE_TARGET ?? "https://bergholz.com.br"
const secret = process.env.REVALIDATE_SECRET

if (!secret) {
  console.error("REVALIDATE_SECRET is not set (add it to .env or run `vercel env pull`)")
  process.exit(1)
}

const response = await fetch(`${target}/api/revalidate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` }
})
const body = await response.text()
console.log(`${response.status} ${body}`)
process.exit(response.ok ? 0 : 1)
