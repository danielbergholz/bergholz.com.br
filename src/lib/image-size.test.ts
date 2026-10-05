import assert from "node:assert/strict"
import { test } from "node:test"
import { imageSize } from "./image-size.ts"

// Minimal headers for each format, padded like a real file would be.
function bytes(...parts: (string | number[])[]): Uint8Array {
  const out: number[] = []
  for (const part of parts) {
    if (typeof part === "string") out.push(...Buffer.from(part, "latin1"))
    else out.push(...part)
  }
  while (out.length < 40) out.push(0)
  return Uint8Array.from(out)
}
const le16 = (n: number) => [n & 0xff, n >> 8]
const le24 = (n: number) => [n & 0xff, (n >> 8) & 0xff, n >> 16]
const be16 = (n: number) => [n >> 8, n & 0xff]
const be32 = (n: number) => [0, 0, ...be16(n)]

test("imageSize reads PNG, GIF, JPEG and every WebP variant", () => {
  const size = { width: 1600, height: 884 }
  assert.deepEqual(
    imageSize(
      bytes([0x89], "PNG\r\n\x1a\n", be32(13), "IHDR", be32(1600), be32(884))
    ),
    size
  )
  assert.deepEqual(imageSize(bytes("GIF89a", le16(1600), le16(884))), size)
  assert.deepEqual(
    imageSize(
      bytes(
        [0xff, 0xd8, 0xff, 0xe0],
        be16(4),
        [0, 0],
        [0xff, 0xc0],
        be16(17),
        [8],
        be16(884),
        be16(1600)
      )
    ),
    size
  )
  const riff = (chunk: string, payload: number[]) =>
    bytes("RIFF", [0, 0, 0, 0], "WEBP", chunk, [0, 0, 0, 0], payload)
  assert.deepEqual(
    imageSize(
      riff("VP8 ", [0, 0, 0, 0x9d, 0x01, 0x2a, ...le16(1600), ...le16(884)])
    ),
    size
  )
  const lossless = (1600 - 1) | ((884 - 1) << 14)
  assert.deepEqual(
    imageSize(
      riff("VP8L", [
        0x2f,
        lossless & 0xff,
        (lossless >> 8) & 0xff,
        (lossless >> 16) & 0xff,
        (lossless >>> 24) & 0xff
      ])
    ),
    size
  )
  assert.deepEqual(
    imageSize(riff("VP8X", [0, 0, 0, 0, ...le24(1599), ...le24(883)])),
    size
  )
})

test("imageSize returns undefined for unknown or truncated data", () => {
  assert.equal(imageSize(bytes("not an image")), undefined)
  assert.equal(imageSize(Uint8Array.from([0x89, 0x50])), undefined)
})
