// AC = consulta, AP = procedimiento, AT = estancia / internación.
export type CupsRipsType = "AC" | "AP" | "AT"

export interface CupsProcedure {
  code: string
  name: string
  ripsType: CupsRipsType | null
  isEnabled: boolean
}

export interface CupsSuggestion {
  code: string
  name: string
  ripsType: CupsRipsType | null
  // 0 a 1: qué tanto se parecen las descripciones. Es solo una ayuda para elegir.
  score: number
}

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
