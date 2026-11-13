// Utilidades de imagen del estudio de firmas: todo se procesa en el navegador con canvas.
// El resultado siempre es un PNG con fondo transparente, recortado al trazo y con un tamaño
// acotado, para que se vea nítido impreso y no pese en la base de datos.

export const INK_COLORS = {
  black: { label: "Negro", value: "#16191d" },
  blue: { label: "Azul", value: "#1f3a8a" },
} as const

export type InkKey = keyof typeof INK_COLORS

// Tamaño máximo de la firma guardada. En los documentos se muestra a 90px de alto, así que
// 260px de alto deja margen para impresión a buena resolución.
const MAX_WIDTH = 720
const MAX_HEIGHT = 260
const TRIM_PADDING = 8

export interface ExportedSignature {
  imageData: string
  width: number
  height: number
}

/** Recorta el canvas a la zona con trazo. Devuelve null si está vacío. */
export function trimCanvas(source: HTMLCanvasElement, padding = TRIM_PADDING): HTMLCanvasElement | null {
  const ctx = source.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  const { width, height } = source
  if (!width || !height) return null
  const { data } = ctx.getImageData(0, 0, width, height)

  let top = height
  let left = width
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      if (data[row + x * 4 + 3] > 10) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  if (right < 0) return null

  left = Math.max(0, left - padding)
  top = Math.max(0, top - padding)
  right = Math.min(width - 1, right + padding)
  bottom = Math.min(height - 1, bottom + padding)

  const out = document.createElement("canvas")
  out.width = right - left + 1
  out.height = bottom - top + 1
  out.getContext("2d")!.drawImage(source, left, top, out.width, out.height, 0, 0, out.width, out.height)
  return out
}

/** Reduce el canvas para que quepa en el tamaño máximo (nunca lo agranda). */
function fitCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_WIDTH / source.width, MAX_HEIGHT / source.height)
  if (scale === 1) return source
  const out = document.createElement("canvas")
  out.width = Math.max(1, Math.round(source.width * scale))
  out.height = Math.max(1, Math.round(source.height * scale))
  const ctx = out.getContext("2d")!
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, 0, 0, out.width, out.height)
  return out
}

/** Recorta, ajusta el tamaño y exporta a PNG. Devuelve null si no hay trazo. */
export function exportSignature(source: HTMLCanvasElement): ExportedSignature | null {
  const trimmed = trimCanvas(source)
  if (!trimmed) return null
  const fitted = fitCanvas(trimmed)
  return { imageData: fitted.toDataURL("image/png"), width: fitted.width, height: fitted.height }
}

/* ───────────────────────────── Dibujo a mano ───────────────────────────── */

export interface StrokePoint {
  x: number
  y: number
  w: number // grosor ya calculado (velocidad y presión)
}

export type Stroke = StrokePoint[]

/** Dibuja los trazos con curvas suaves y grosor variable, como una pluma. */
export function paintStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], color: string, scale = 1) {
  ctx.save()
  ctx.scale(scale, scale)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  for (const stroke of strokes) {
    if (stroke.length === 0) continue
    if (stroke.length === 1) {
      const p = stroke[0]
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    // Cada tramo va del punto medio anterior al siguiente, con el punto real como control:
    // así la línea pasa suave por los puntos sin esquinas.
    let prevMid = stroke[0]
    for (let i = 1; i < stroke.length; i++) {
      const p = stroke[i - 1]
      const q = stroke[i]
      const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, w: (p.w + q.w) / 2 }
      ctx.beginPath()
      ctx.lineWidth = (prevMid.w + mid.w) / 2
      ctx.moveTo(prevMid.x, prevMid.y)
      ctx.quadraticCurveTo(p.x, p.y, mid.x, mid.y)
      ctx.stroke()
      prevMid = mid
    }
    const last = stroke[stroke.length - 1]
    ctx.beginPath()
    ctx.lineWidth = last.w
    ctx.moveTo(prevMid.x, prevMid.y)
    ctx.lineTo(last.x, last.y)
    ctx.stroke()
  }
  ctx.restore()
}

/** Exporta los trazos a una firma en el color indicado (a doble resolución). */
export function exportStrokes(strokes: Stroke[], width: number, height: number, color: string) {
  const scale = 2
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  paintStrokes(canvas.getContext("2d")!, strokes, color, scale)
  return exportSignature(canvas)
}

/* ───────────────────────────── Firma escrita ───────────────────────────── */

/** Dibuja el texto con la fuente caligráfica elegida. Espera a que la fuente cargue. */
export async function renderTypedSignature(text: string, fontFamily: string, color: string) {
  const clean = text.trim()
  if (!clean) return null
  const size = 120
  const font = `${size}px ${fontFamily}`
  try {
    await document.fonts.load(font, clean)
  } catch {
    // Si la fuente no carga se usa la de respaldo; no bloquea la firma.
  }

  const probe = document.createElement("canvas").getContext("2d")!
  probe.font = font
  const metrics = probe.measureText(clean)
  // Las fuentes caligráficas sobresalen de su caja: se deja margen amplio y luego se recorta.
  const width = Math.ceil(metrics.width + size * 1.5)
  const height = Math.ceil(size * 2.4)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = "alphabetic"
  ctx.fillText(clean, size * 0.75, size * 1.5)
  return exportSignature(canvas)
}

/* ───────────────────────────── Imagen subida ───────────────────────────── */

export type UploadInk = "original" | InkKey

export interface CleanOptions {
  // 0 = conserva solo lo más oscuro · 1 = conserva trazos claros (y algo de fondo)
  sensitivity: number
  ink: UploadInk
}

const MAX_UPLOAD_SIDE = 1600

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("No se pudo leer la imagen."))
    }
    img.src = url
  })
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Quita el fondo de una foto o escaneo de la firma: estima el tono del papel, vuelve
 * transparente lo que se le parece y conserva el trazo con bordes suaves.
 */
export function cleanSignatureImage(img: HTMLImageElement, { sensitivity, ink }: CleanOptions) {
  const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image
  const pixelCount = data.length / 4

  // Luminancia de cada píxel y tono del papel (percentil 85: el papel domina la imagen).
  const lum = new Float32Array(pixelCount)
  const histogram = new Uint32Array(256)
  let transparentCount = 0
  for (let i = 0; i < pixelCount; i++) {
    const a = data[i * 4 + 3]
    if (a < 10) {
      transparentCount++
      lum[i] = 255
      continue
    }
    const l = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]
    lum[i] = l
    histogram[Math.round(l)]++
  }
  const opaque = pixelCount - transparentCount
  let paper = 255
  if (opaque > 0) {
    let acc = 0
    for (let l = 0; l < 256; l++) {
      acc += histogram[l]
      if (acc >= opaque * 0.85) {
        paper = l
        break
      }
    }
  }

  // Por encima de `hi` es papel (transparente); por debajo de `lo` es tinta plena.
  const hi = paper * (0.62 + 0.3 * sensitivity)
  const lo = hi * 0.55
  const inkRgb = ink === "original" ? null : hexToRgb(INK_COLORS[ink].value)

  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4
    const l = lum[i]
    const srcAlpha = data[o + 3] / 255
    let alpha = l >= hi ? 0 : l <= lo ? 1 : (hi - l) / (hi - lo)
    alpha *= srcAlpha
    if (inkRgb) {
      data[o] = inkRgb[0]
      data[o + 1] = inkRgb[1]
      data[o + 2] = inkRgb[2]
    }
    data[o + 3] = Math.round(alpha * 255)
  }
  ctx.putImageData(image, 0, 0)
  return exportSignature(canvas)
}
