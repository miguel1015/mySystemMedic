export interface DiagnosisRow {
  id: number
  cie10Id: number | null
  code: string
  diagnosis: string
  main: boolean
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
  glasgow: number
  weight: number
  height: number
}

export interface SubjectiveState {
  motivoConsulta: string
  enfermedadActual: string
}

export interface PhysicalExamState {
  cabezaCuello: string
  torax: string
  abdomen: string
  extremidades: string
  sistemaNervioso: string
  organosSentidos: string
  genitourinario: string
}

export interface AntecedentesState {
  padres: string
  personalesMedicos: string
  otrosFamiliares: string
  alergicos: string
  quirurgicos: string
  toxicos: string
  transfusiones: string
  habitos: string
  traumas: string
}
