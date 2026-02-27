export function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function isImageSrc(src: string) {
  if (src.startsWith("blob:")) return true
  if (src.startsWith("data:image/")) return true
  if (src.startsWith("data:application/pdf")) return false
  if (/\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(src)) return true
  return false
}
