// Acompañante del paciente durante una admisión. Uno por admisión.

export interface AdmissionCompanionRequest {
  documentTypeId: number
  documentNumber: string
  firstName: string
  middleName?: string | null
  lastName: string
  secondLastName?: string | null
  kinshipTypeId: number
  email?: string | null
  phone: string
  address?: string | null
}

export interface AdmissionCompanionResponse extends AdmissionCompanionRequest {
  id: number
  admissionId: number
  documentTypeCode: string
  documentTypeName: string
  fullName: string
  kinshipTypeName: string
  createdAt: string
  updatedAt: string
}

export interface KinshipType {
  id: number
  name: string
  isActive: boolean
}
