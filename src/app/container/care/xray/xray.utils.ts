import type { ResultadoRayosX } from "@/core/interfaces/care/rayosX"

const pad = (n: number) => n.toString().padStart(2, "0")

// "2026-10-02" / "2026-10-02T00:00:00" -> [2026, 10, 2] sin pasar por Date(),
// que interpretaría la fecha en UTC y podría correrla un día.
const parseDateParts = (value?: string | null) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "")
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

export const todayIsoDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export const formatStudyDate = (value?: string | null) => {
  const parts = parseDateParts(value)
  if (!parts) return value || ""
  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`
}

export const calculateAgeLabel = (birthDate?: string | null) => {
  const parts = parseDateParts(birthDate)
  if (!parts) return ""

  const today = new Date()
  let age = today.getFullYear() - parts.year
  const monthDiff = today.getMonth() + 1 - parts.month
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parts.day)) age -= 1

  if (age < 0) return ""
  return `${age} ${age === 1 ? "año" : "años"}`
}

export const RESULTADO_COLORS: Record<ResultadoRayosX, string> = {
  Normal: "green",
  Anormal: "red",
  Limitado: "orange",
  Concluyente: "blue",
}
