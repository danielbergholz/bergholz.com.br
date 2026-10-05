import { spawn } from "node:child_process"
import { once } from "node:events"
import { watch } from "node:fs"

const compile = () =>
  spawn(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "scripts/build-blog.ts"],
    { stdio: "inherit" }
  )
if ((await once(compile(), "exit"))[0] !== 0) process.exit(1)
const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(2)],
  { stdio: "inherit" }
)
let timer
let compiling = false
let pending = false
async function rebuild() {
  if (compiling) {
    pending = true
    return
  }
  compiling = true
  await once(compile(), "exit")
  compiling = false
  if (pending) {
    pending = false
    void rebuild()
  }
}
const watcher = watch(
  "content/blog",
  { recursive: true },
  (_event, filename) => {
    if (!filename?.endsWith(".md")) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      void rebuild()
    }, 100)
  }
)
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => next.kill(signal))
next.on("exit", (code) => {
  watcher.close()
  clearTimeout(timer)
  process.exit(code ?? 0)
})
