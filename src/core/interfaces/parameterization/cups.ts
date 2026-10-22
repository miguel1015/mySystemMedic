// AC = consulta, AP = procedimiento, AT = estancia / internación.
export type CupsRipsType = "AC" | "AP" | "AT"

export interface CupsProcedure {
  code: string
  name: string
  ripsType: CupsRipsType | null
  isEnabled: boolean
  // Agregado por un usuario: no viene de la tabla de SISPRO.
  isManual: boolean
}

// CUPS que no está en el catálogo: se agrega al guardar el detalle de tarifa, con la
// descripción del detalle como nombre y sin tipo RIPS.
export interface NewCups {
  code: string
}

export interface CupsSuggestion {
  code: string
  name: string
  ripsType: CupsRipsType | null
  // 0 a 1: qué tanto se parecen las descripciones. Es solo una ayuda para elegir.
  score: number
  // Hoja del manual tarifario que homologa el CUPS; null si es por similitud de la descripción.
  source: CupsSuggestionSource | null
}

// T = tarifas 2026, H2 / H1 = homologadores, SOD = reemplazo vigente de un CUPS "SOD" deshabilitado.
export type CupsSuggestionSource = "T" | "H2" | "H1" | "SOD"

export interface CupsHomologationItem {
  referenceCode: number
  description: string
  tariffDetailCount: number
  billedCount: number
  cupsCode: string | null
  cupsName: string | null
  hasConflictingCups: boolean
  suggestions: CupsSuggestion[]
}

export interface CupsHomologationSummary {
  totalCodes: number
  homologatedCodes: number
  pendingCodes: number
  pendingBilledCodes: number
}

export interface CupsHomologationPage {
  items: CupsHomologationItem[]
  totalCount: number
  page: number
  pageSize: number
  summary: CupsHomologationSummary
}

export interface CupsHomologationUpdateResponse {
  referenceCode: number
  cupsCode: string | null
  cupsName: string | null
  updatedTariffDetails: number
}

export type CupsHomologationStatus = "pending" | "done" | "all"
