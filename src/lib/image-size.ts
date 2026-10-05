// Intrinsic size of a local article image, read from its header so the build
// can emit width/height (no layout shift) without an image dependency.
// Covers the formats public/blog/ uses: PNG, WebP, GIF and JPEG.
export type ImageSize = { width: number; height: number }

export function imageSize(data: Uint8Array): ImageSize | undefined {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...data.subarray(start, end))
  if (data.length < 30) return undefined

  if (ascii(1, 4) === "PNG") {
    return { width: view.getUint32(16), height: view.getUint32(20) }
  }
  if (ascii(0, 4) === "GIF8") {
    return {
      width: view.getUint16(6, true),
      height: view.getUint16(8, true)
    }
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    const chunk = ascii(12, 16)
    if (chunk === "VP8 ") {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff
      }
    }
    if (chunk === "VP8L") {
      const bits = view.getUint32(21, true)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
    if (chunk === "VP8X") {
      const uint24 = (offset: number) =>
        data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16)
      return { width: uint24(24) + 1, height: uint24(27) + 1 }
    }
    return undefined
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    // Walk the JPEG segments to the first start-of-frame marker.
    let offset = 2
    while (offset + 9 < data.length) {
      if (data[offset] !== 0xff) return undefined
      const marker = data[offset + 1]
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return {
          width: view.getUint16(offset + 7),
          height: view.getUint16(offset + 5)
        }
      }
      offset += 2 + view.getUint16(offset + 2)
    }
  }
  return undefined
}
