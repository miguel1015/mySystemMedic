import type { ClinicalRecordModuleType } from "@/core/constants/clinicalRecordModules"

export interface ClinicalRecordAuthor {
  id: number
  fullName: string
  role: string
}

export interface ClinicalRecordDetailField {
  label: string
  value: string
}

export interface ClinicalRecordSummary {
  id: number
  moduleType: ClinicalRecordModuleType
  createdAt: string
  author: ClinicalRecordAuthor
  excerpt: string
  fields: ClinicalRecordDetailField[]
}
