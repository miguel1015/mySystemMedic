export type BillingMovementType = "service" | "medicine" | "supply" | "surgery"

export const BILLING_SERVICE_CATEGORIES = [
  "Consulta",
  "Procedimiento",
  "Imagen diagnóstica / RX",
  "Laboratorio",
  "Procedimiento quirúrgico",
  "Estancia",
  "Otro",
] as const

export type BillingServiceCategory = (typeof BILLING_SERVICE_CATEGORIES)[number]

export const SURGICAL_CONCEPT_TYPES = [
  { value: "HONORARIO_CIRUJANO", label: "Honorario cirujano" },
  { value: "HONORARIO_ANESTESIOLOGO", label: "Honorario anestesiólogo" },
  { value: "HONORARIO_AYUDANTIA", label: "Honorario ayudantía" },
  { value: "DERECHO_SALA", label: "Derechos de sala" },
  { value: "MATERIALES", label: "Materiales de cirugía" },
] as const

export type SurgicalConceptType = (typeof SURGICAL_CONCEPT_TYPES)[number]["value"]

export interface SurgicalConceptDetail {
  itemId: number
  conceptType: string
  code: number
  label: string
  qxGroup: string | null
  unitValue: number
}

export function parseConceptDetails(json: string | null | undefined): SurgicalConceptDetail[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function serializeConceptDetails(details: SurgicalConceptDetail[]): string {
  return JSON.stringify(details)
}

export interface BillingMovementResponse {
  id: number
  admissionId: number
  movementType: BillingMovementType
  itemId: number | null
  itemCode: string | null
  name: string
  quantity: number
  unitValue: number
  totalValue: number
  contractId: number | null
  contractName: string | null
  serviceCategory: string | null
  conceptType: string | null
  conceptDetails: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BillingMovementCreateRequest {
  admissionId: number
  movementType: BillingMovementType
  itemId: number | null
  itemCode: string | null
  name: string
  quantity: number
  unitValue: number
  contractId: number | null
  serviceCategory: string | null
  conceptType: string | null
  conceptDetails: string | null
  notes: string | null
}

export type BillingMovementUpdateRequest = Omit<
  BillingMovementCreateRequest,
  "admissionId"
>
