export type TriageNotificationStatus = "PENDIENTE" | "RESUELTA" | "CANCELADA"

// Paciente nuevo que espera triage.
export interface TriageNotification {
  id: number
  patientId: number
  patientName: string
  documentNumber: string
  documentTypeCode: string | null
  insurerName: string | null
  birthDate: string
  status: TriageNotificationStatus
  createdAt: string
  createdByName: string | null
  triageId: number | null
  resolvedAt: string | null
  resolvedByName: string | null
  seen: boolean
}

// canReceive = false: el perfil del usuario no recibe avisos de triage.
export interface TriageNotificationsResponse {
  canReceive: boolean
  items: TriageNotification[]
}
