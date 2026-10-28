import type {
  AnalitoCatalogo,
  EstudioCatalogo,
  ResultadoAnalitoRequest,
} from "@/core/interfaces/care/laboratorio"

export type LabValue = number | string | null | undefined
export type LabValues = Record<string, LabValue>

export type LabStatus = "criticoBajo" | "bajo" | "normal" | "alto" | "criticoAlto"

export const STATUS_LABEL: Record<LabStatus, string> = {
  criticoBajo: "Crítico bajo",
  bajo: "Bajo",
  normal: "Normal",
  alto: "Alto",
  criticoAlto: "Crítico alto",
}

export const STATUS_COLOR: Record<LabStatus, string> = {
  criticoBajo: "red",
  bajo: "orange",
  normal: "green",
  alto: "orange",
  criticoAlto: "red",
}

// Diferencial leucocitaria: los porcentajes deben sumar 100 %.
export const DIFFERENTIAL_KEYS = [
  "linfocitos",
  "monocitos",
  "neutrofilosSegmentados",
  "neutrofilosCayado",
  "eosinofilos",
  "basofilos",
]

const numberOrNull = (value: LabValue) => {
  if (value === null || value === undefined || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

const formatter = (decimals: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: Math.max(decimals, 2) })

export const formatNumber = (value: number, decimals = 2) => formatter(decimals).format(value)

// Índices eritrocitarios a partir de los valores medidos:
// VCM (fL) = Hto × 10 / GR · HCM (pg) = Hb × 10 / GR · CHCM (g/dL) = Hb × 100 / Hto
export const computeIndices = (values: LabValues): Record<"hcm" | "chcm" | "vcm", number | null> => {
  const gr = numberOrNull(values.globulosRojos)
  const hb = numberOrNull(values.hemoglobina)
  const hto = numberOrNull(values.hematocrito)
  return {
    vcm: gr && hto ? round((hto * 10) / gr, 1) : null,
    hcm: gr && hb ? round((hb * 10) / gr, 1) : null,
    chcm: hb && hto ? round((hb * 100) / hto, 1) : null,
  }
}

export const INDEX_KEYS = ["hcm", "chcm", "vcm"] as const
export const INDEX_SOURCES = ["globulosRojos", "hemoglobina", "hematocrito"]

export const labStatus = (
  analito: Pick<AnalitoCatalogo, "referenciaMin" | "referenciaMax" | "criticoBajo" | "criticoAlto">,
  value: LabValue,
): LabStatus | null => {
  const n = numberOrNull(value)
  if (n === null) return null
  if (analito.criticoBajo !== null && n < analito.criticoBajo) return "criticoBajo"
  if (analito.criticoAlto !== null && n > analito.criticoAlto) return "criticoAlto"
  if (analito.referenciaMin === null || analito.referenciaMax === null) return null
  if (n < analito.referenciaMin) return "bajo"
  if (n > analito.referenciaMax) return "alto"
  return "normal"
}

// Recuento absoluto de una célula de la diferencial (leucocitos × %).
export const absoluteCount = (values: LabValues, key: string) => {
  if (!DIFFERENTIAL_KEYS.includes(key)) return null
  const leucocitos = numberOrNull(values.leucocitos)
  const pct = numberOrNull(values[key])
  if (leucocitos === null || pct === null) return null
  return Math.round((leucocitos * pct) / 100)
}

// Avisos de posibles errores de digitación; no impiden guardar.
export const consistencyWarnings = (values: LabValues): string[] => {
  const warnings: string[] = []

  const differential = DIFFERENTIAL_KEYS.map((k) => numberOrNull(values[k])).filter(
    (n): n is number => n !== null,
  )
  if (differential.length >= 2) {
    const sum = differential.reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 100) > 1) {
      warnings.push(
        `La diferencial leucocitaria suma ${formatNumber(sum, 1)} %; debe sumar 100 %.`,
      )
    }
  }

  const hb = numberOrNull(values.hemoglobina)
  const hto = numberOrNull(values.hematocrito)
  if (hb !== null && hto !== null && Math.abs(hto - hb * 3) > 3) {
    warnings.push(
      `El hematocrito (${formatNumber(hto, 1)} %) no corresponde a unas 3 veces la hemoglobina ` +
        `(${formatNumber(hb, 1)} g/dL ≈ ${formatNumber(hb * 3, 1)} %). Verifique la digitación.`,
    )
  }

  return warnings
}

export const criticalValues = (estudio: EstudioCatalogo | undefined, values: LabValues) =>
  (estudio?.analitos ?? []).flatMap((a) => {
    const status = labStatus(a, values[a.clave])
    return status === "criticoBajo" || status === "criticoAlto"
      ? [`${a.nombre}: ${formatNumber(Number(values[a.clave]), a.decimales)}${a.unidad ? ` ${a.unidad}` : ""}`]
      : []
  })

export const toResultRequests = (
  estudio: EstudioCatalogo,
  values: LabValues,
): ResultadoAnalitoRequest[] =>
  estudio.analitos.flatMap<ResultadoAnalitoRequest>((a) => {
    const value = values[a.clave]
    if (a.tipo === "opcion") {
      return typeof value === "string" && value ? [{ clave: a.clave, texto: value }] : []
    }
    const n = numberOrNull(value)
    return n === null ? [] : [{ clave: a.clave, valor: n }]
  })

export const fromResultRequests = (items: { clave: string; valor?: number | null; texto?: string | null }[]) =>
  Object.fromEntries(items.map((r) => [r.clave, r.texto ?? r.valor ?? null])) as LabValues
