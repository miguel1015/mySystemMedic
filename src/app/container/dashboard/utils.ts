import { useEffect, useState } from "react"
import { TriagePriority } from "@/core/interfaces/care/types"

// Escala de triage (rojo, naranja, amarillo, verde, azul). Validada con la skill dataviz:
// pares adyacentes distinguibles con daltonismo (ΔE ≥ 15) y con visión normal. El
// amarillo no llega a 3:1 sobre blanco, por eso cada nivel va siempre con su número romano.
export const TRIAGE_LEVELS: { level: TriagePriority; label: string; color: string }[] = [
  { level: "I", label: "Resucitación", color: "#c9302c" },
  { level: "II", label: "Emergencia", color: "#ee7d14" },
  { level: "III", label: "Urgencia", color: "#f5cf3a" },
  { level: "IV", label: "Menos urgente", color: "#2e9a4c" },
  { level: "V", label: "No urgente", color: "#2a63c9" },
]

// Color de una serie única (marca). En oscuro, un paso más claro con ≥ 3:1 sobre la superficie.
export const SERIES_COLOR = { light: "#0f6f5c", dark: "#2fa682" }

// Últimos `count` meses terminando en el actual: claves "2026-11" y etiquetas "nov".
export function lastMonths(now: Date, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      short: d.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
      long: d.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
      month: d.toLocaleDateString("es-CO", { month: "long" }),
    }
  })
}

export function monthKey(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function countBy<T>(items: T[], key: (item: T) => string | null | undefined) {
  const acc = new Map<string, number>()
  items.forEach((item) => {
    const k = key(item)
    if (k) acc.set(k, (acc.get(k) ?? 0) + 1)
  })
  return acc
}

// Lee un token de color del tema actual (claro u oscuro) para pasárselo a Chart.js.
export function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const numberFormat = new Intl.NumberFormat("es-CO")
export const formatNumber = (value: number) => numberFormat.format(value)

const LOWER_WORDS = new Set(["de", "del", "la", "las", "los", "y", "e"])

// "LUIS DE LA HOZ" -> "Luis de la Hoz"; "COMPAÑÍA MUNDIAL DE SEGUROS S.A." -> "Compañía
// Mundial de Seguros S.A.". Nombres y catálogos llegan en mayúsculas.
export function toTitleCase(text?: string | null) {
  const parts = (text ?? "").trim().toLocaleLowerCase("es-CO").split(/\s+/).filter(Boolean)
  return parts
    .map((p, i) => {
      if (p.includes(".")) return p.toLocaleUpperCase("es-CO")
      if (i > 0 && LOWER_WORDS.has(p)) return p
      return p[0].toLocaleUpperCase("es-CO") + p.slice(1)
    })
    .join(" ")
}

export function toDisplayName(fullName?: string | null) {
  return toTitleCase(fullName) || "Sin nombre"
}

// "URGENCIAS" -> "Urgencias". Los catálogos llegan en mayúsculas.
export function toSentenceCase(text?: string | null) {
  const t = (text ?? "").trim().toLocaleLowerCase("es-CO")
  return t ? t[0].toLocaleUpperCase("es-CO") + t.slice(1) : ""
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Tiempo transcurrido desde una fecha, en el formato corto que se lee de un vistazo.
export function elapsedSince(iso: string, now: Date) {
  const start = new Date(iso)
  if (isNaN(start.getTime())) return "—"
  const minutes = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours} h ${minutes % 60} min`
  const days = Math.floor(hours / 24)
  if (days < 60) return `${days} días`
  return `${Math.floor(days / 30)} meses`
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })
}

// Hora actual que se refresca cada minuto (marcador "ahora", saludo y tiempos en atención).
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

// true cuando una carga lleva más de `ms`: el backend gratuito tarda en despertar.
export function useIsSlow(isLoading: boolean, ms = 6000) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!isLoading) {
      setSlow(false)
      return
    }
    const id = setTimeout(() => setSlow(true), ms)
    return () => clearTimeout(id)
  }, [isLoading, ms])
  return slow
}

export function greetingFor(date: Date) {
  const h = date.getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}
