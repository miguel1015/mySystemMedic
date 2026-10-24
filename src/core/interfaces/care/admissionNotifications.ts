import { TriagePriority } from "./types"

export type AdmissionNotificationStatus = "PENDIENTE" | "RESUELTA" | "CANCELADA"

export interface AdmissionNotification {
  id: number
  triageId: number
  patientId: number
  patientName: string
  documentNumber: string
  documentTypeCode: string | null
  priority: TriagePriority
  isUrgent: boolean
  consultationReason: string
  triageDateTime: string
  status: AdmissionNotificationStatus
  createdAt: string
  createdByName: string | null
  resolvedAt: string | null
  resolvedByName: string | null
  seen: boolean
}

// canReceive = false: el usuario no es admisionista y no ve la campana.
export interface AdmissionNotificationsResponse {
  canReceive: boolean
  items: AdmissionNotification[]
}
