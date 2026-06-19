export type DiagnosisType = "Principal" | "Relacionado" | "Secundario"

export interface DiagnosisRow {
  id: number
  code: string
  diagnosis: string
  type: DiagnosisType
  main: boolean
  required: boolean
}

export interface QxSearchItem {
  code: string
  description: string
}

export interface VitalsState {
  ta: string
  fc: number
  fr: number
  temperature: number
  saturation: number
  glasgow: number
  weight: number
  height: number
}

export interface EvoVitalsState {
  ta: string
  fc: number
  fr: number
  temperature: number
  saturation: number
  weight: number
  height: number
}
