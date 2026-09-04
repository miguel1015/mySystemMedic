import { SurgicalConceptType } from "@/core/interfaces/care/billing"
import { SURGICAL_WAY_TYPES, SurgicalWayType } from "@/core/interfaces/care/surgicalCharge"

export const surgicalWayTypeOptions = SURGICAL_WAY_TYPES.map((value) => ({
  value,
  label: value,
}))

export const DEFAULT_LIQUIDATION_PERCENTAGE = 100

const MEDICAL_FEE_CONCEPT_TYPES: SurgicalConceptType[] = [
  "HONORARIO_CIRUJANO",
  "HONORARIO_ANESTESIOLOGO",
  "HONORARIO_AYUDANTIA",
]

// Porcentajes de liquidación por tipo de vía, para los tipos de vía que tienen una regla
// especial. Las modalidades que no aparecen aquí conservan la liquidación al 100%.
const SURGICAL_WAY_LIQUIDATION_RULES: Partial<
  Record<SurgicalWayType, { medicalFees: number; materials: number; roomFee: number }>
> = {
  "Misma especialidad - diferente vía": { medicalFees: 75, materials: 75, roomFee: 50 },
  "Misma especialidad - única vía": { medicalFees: 50, materials: 0, roomFee: 0 },
}

export function getSurgicalWayLiquidationPercentage(
  surgicalWayType: SurgicalWayType | null,
  conceptType: string,
): number {
  const rule = surgicalWayType ? SURGICAL_WAY_LIQUIDATION_RULES[surgicalWayType] : undefined
  if (!rule) return DEFAULT_LIQUIDATION_PERCENTAGE

  if (MEDICAL_FEE_CONCEPT_TYPES.includes(conceptType as SurgicalConceptType)) return rule.medicalFees
  if (conceptType === "MATERIALES") return rule.materials
  if (conceptType === "DERECHO_SALA") return rule.roomFee

  return DEFAULT_LIQUIDATION_PERCENTAGE
}
