export type LabResultValue = string | number | null | undefined

export interface LabRecord {
  id: number
  studyId: number
  studyCode: string
  studyName: string
  professionalId: number
  professionalName: string
  professionalProfile?: string
  professionalLicense?: string
  professionalSignature?: string
  fechaToma: string
  resultados: Record<string, LabResultValue>
  createdAt: string
  updatedAt: string
}
