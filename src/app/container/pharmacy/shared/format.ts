import type { InventoryStatus, MovementType, ProductType } from "@/core/interfaces/pharmacy/types"

const qtyFormat = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 })

export const fmtQty = (n?: number | null) => qtyFormat.format(Number(n ?? 0))

// "TABLETA RECUBIERTA" -> "tableta recubierta" (las unidades se leen mejor en minúscula).
export const fmtUnit = (unit?: string | null) => (unit ?? "").toLocaleLowerCase("es-CO")

// "2026-01-31" -> "31/01/2026" sin pasar por Date (evita el corrimiento de zona horaria).
export function fmtDate(value?: string | null) {
  if (!value) return "—"
  const [y, m, d] = value.slice(0, 10).split("-")
  return y && m && d ? `${d}/${m}/${y}` : value
}

export function fmtDateTime(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return `${date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })} ${date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
}

// Fecha de hoy del navegador como "yyyy-MM-dd".
export function todayIso() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const movementNumber = (id: number) => `MOV-${String(id).padStart(6, "0")}`

export function expiryHint(days: number) {
  if (days < 0) return `Venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`
  if (days === 0) return "Vence hoy"
  if (days < 60) return `Vence en ${days} ${days === 1 ? "día" : "días"}`
  const months = Math.round(days / 30)
  return `Vence en ${months} meses`
}

export const STATUS_META: Record<InventoryStatus, { label: string; color: string }> = {
  Disponible: { label: "Disponible", color: "green" },
  ProximoAVencer: { label: "Próximo a vencer", color: "gold" },
  Vencido: { label: "Vencido", color: "red" },
  Agotado: { label: "Agotado", color: "default" },
}

export const MOVEMENT_META: Record<MovementType, { label: string; color: string }> = {
  Entrada: { label: "Entrada", color: "green" },
  Dispensacion: { label: "Dispensación", color: "blue" },
  Traslado: { label: "Traslado", color: "purple" },
  Salida: { label: "Salida", color: "orange" },
  Ajuste: { label: "Ajuste", color: "cyan" },
}

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: "Medicamento", label: "Medicamentos" },
  { value: "Insumo", label: "Insumos" },
]

export const productKey = (type: ProductType, id: number) => `${type}:${id}`
