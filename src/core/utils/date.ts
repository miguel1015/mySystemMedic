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

/** Edad cumplida en años, o null si la fecha no es válida o es futura. */
export const ageInYears = (birthDate: DateInput, at: Date = new Date()): number | null => {
  const birth = toDate(birthDate)
  if (!birth || birth > at) return null
  let years = at.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    at.getMonth() < birth.getMonth() ||
    (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate())
  if (beforeBirthday) years -= 1
  return years
}

/** "34 años", "1 año"; en menores de un año "8 meses" o "12 días". */
export const formatAge = (birthDate: DateInput, empty = "—", at: Date = new Date()) => {
  const birth = toDate(birthDate)
  const years = ageInYears(birth, at)
  if (!birth || years === null) return empty
  if (years >= 1) return `${years} ${years === 1 ? "año" : "años"}`

  let months = (at.getFullYear() - birth.getFullYear()) * 12 + at.getMonth() - birth.getMonth()
  if (at.getDate() < birth.getDate()) months -= 1
  if (months >= 1) return `${months} ${months === 1 ? "mes" : "meses"}`

  const days = Math.floor((at.getTime() - birth.getTime()) / 86_400_000)
  return `${days} ${days === 1 ? "día" : "días"}`
}

/** Tiempo desde el ingreso: "45 min", "6 h", "3 días". Vacío si la fecha no es válida. */
export const formatStay = (since: DateInput, at: Date = new Date()) => {
  const start = toDate(since)
  if (!start || start > at) return ""
  const min = Math.floor((at.getTime() - start.getTime()) / 60_000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  return `${d} ${d === 1 ? "día" : "días"}`
}

// Rangos de estancia para filtrar listas de pacientes activos, en orden.
export const STAY_BUCKETS = ["Menos de 1 día", "1 a 3 días", "4 a 7 días", "Más de 7 días"]

export const stayBucket = (since: DateInput, at: Date = new Date()) => {
  const start = toDate(since)
  if (!start) return undefined
  const days = (at.getTime() - start.getTime()) / 86_400_000
  if (days < 1) return STAY_BUCKETS[0]
  if (days < 4) return STAY_BUCKETS[1]
  if (days < 8) return STAY_BUCKETS[2]
  return STAY_BUCKETS[3]
}
