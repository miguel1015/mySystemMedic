// Formato único de fechas del módulo asistencial: DD/MM/AAAA y hora militar HH:mm.

type DateInput = string | number | Date | null | undefined

const pad = (n: number) => n.toString().padStart(2, "0")

// Las fechas sin hora ("2026-10-21") se interpretan en hora local para no
// correrse un día por la zona horaria, y las que ya vienen como DD/MM/AAAA se
// leen día primero (el navegador las tomaría como MM/DD).
const toDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") return null
  let date: Date
  if (typeof value === "string") {
    const dayFirst = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ ,T]+(\d{1,2}):(\d{2}))?/.exec(value)
    if (dayFirst) {
      const [, d, m, y, h = "0", min = "0"] = dayFirst
      date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min))
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date = new Date(`${value}T00:00:00`)
    } else {
      date = new Date(value)
    }
  } else {
    date = new Date(value)
  }
  return Number.isNaN(date.getTime()) ? null : date
}

const fallbackFor = (value: DateInput, empty: string) =>
  typeof value === "string" && value ? value : empty

/** 21/10/2026 17:43 */
export const formatDateTime = (value: DateInput, empty = "—") => {
  const date = toDate(value)
  if (!date) return fallbackFor(value, empty)
  return `${formatDate(date)} ${formatTime(date)}`
}

/** 21/10/2026 */
export const formatDate = (value: DateInput, empty = "—") => {
  const date = toDate(value)
  if (!date) return fallbackFor(value, empty)
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** 17:43 — acepta también horas sueltas ("17:43" o "17:43:00"). */
export const formatTime = (value: DateInput, empty = "—") => {
  if (typeof value === "string") {
    const match = /^(\d{1,2}):(\d{2})/.exec(value)
    if (match) return `${pad(Number(match[1]))}:${match[2]}`
  }
  const date = toDate(value)
  if (!date) return fallbackFor(value, empty)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
