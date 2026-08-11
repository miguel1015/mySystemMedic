export type BillingMovementType = "service" | "medicine" | "supply"

export const BILLING_SERVICE_CATEGORIES = [
  "Consulta",
  "Procedimiento",
  "Imagen diagnóstica / RX",
  "Laboratorio",
  "Procedimiento quirúrgico",
  "Otro",
] as const

export type BillingServiceCategory = (typeof BILLING_SERVICE_CATEGORIES)[number]

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
  notes: string | null
}

export type BillingMovementUpdateRequest = Omit<
  BillingMovementCreateRequest,
  "admissionId"
>
