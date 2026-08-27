export const SURGICAL_WAY_TYPES = [
  "Misma especialidad - única vía",
  "Misma especialidad - diferente vía",
  "Diferente especialidad - única vía",
  "Diferente especialidad - diferente vía",
] as const

export type SurgicalWayType = (typeof SURGICAL_WAY_TYPES)[number]

export interface SurgicalChargeConceptInput {
  tariffDetailId: number
  referenceCode: number
  description: string
  paymentMethodDescription: string | null
  baseValue: number
  unit: number
  rawValue: number
  roundedValue: number
  percentageApplied: number
}

export interface SurgicalChargeCreateRequest {
  admissionId: number
  tariffId: number
  tariffName: string | null
  surgicalGroupId: number
  surgicalGroupQxGroup: string | null
  serviceCode: number
  serviceName: string
  specialty: string
  doctorId: number
  doctorName: string
  surgicalWayType: SurgicalWayType
  accessRouteId: number
  accessRouteName: string
  concepts: SurgicalChargeConceptInput[]
}

export interface SurgicalChargeResponse extends SurgicalChargeCreateRequest {
  id: number
  createdAt: string
}
