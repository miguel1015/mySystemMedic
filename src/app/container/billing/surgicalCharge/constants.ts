import { SurgicalConceptType } from "@/core/interfaces/care/billing"
import { SURGICAL_WAY_TYPES, SurgicalWayType } from "@/core/interfaces/care/surgicalCharge"

export const surgicalWayTypeOptions = SURGICAL_WAY_TYPES.map((value) => ({
  value,
  label: value,
}))

export const DEFAULT_LIQUIDATION_PERCENTAGE = 100

// Código con el que se liquidan los materiales de una cirugía incruenta por diferente vía.
// Su valor se toma del tarifario seleccionado; si no está allí, se usa la tarifa 2026.
export const INCRUENT_MATERIALS_CODE = 39305
export const INCRUENT_MATERIALS_FALLBACK_VALUE = 105600

const MEDICAL_FEE_CONCEPT_TYPES: SurgicalConceptType[] = [
  "HONORARIO_CIRUJANO",
  "HONORARIO_ANESTESIOLOGO",
  "HONORARIO_AYUDANTIA",
]

interface ConceptPercentages {
  medicalFees: number
  materials: number
  roomFee: number
}

interface SurgicalWayLiquidationRule {
  // Porcentajes de la primera cirugía del cargue; si se omite, se liquida al 100%.
  first?: ConceptPercentages
  // Porcentajes de la segunda cirugía en adelante dentro del mismo cargue.
  additional: ConceptPercentages
  // Código con el que se reemplazan los materiales en todas las cirugías de este tipo de vía.
  materialsCode?: number
}

const FULL_LIQUIDATION: ConceptPercentages = {
  medicalFees: DEFAULT_LIQUIDATION_PERCENTAGE,
  materials: DEFAULT_LIQUIDATION_PERCENTAGE,
  roomFee: DEFAULT_LIQUIDATION_PERCENTAGE,
}

// Cirugías incruentas: en todos los procedimientos del cargue, incluso el primero, los
// derechos de sala van al 45% y los materiales se cobran con el código 39305 al 100%.
// Los honorarios y la ayudantía van al 100% en la primera cirugía y desde la segunda al
// porcentaje del tipo de vía (75% diferente vía, 50% única vía).
const incruentRule = (additionalMedicalFees: number): SurgicalWayLiquidationRule => ({
  first: { medicalFees: 100, materials: 100, roomFee: 45 },
  additional: { medicalFees: additionalMedicalFees, materials: 100, roomFee: 45 },
  materialsCode: INCRUENT_MATERIALS_CODE,
})

// Reglas de liquidación por tipo de vía. Las modalidades que no aparecen aquí
// conservan la liquidación al 100% en todas las cirugías.
const SURGICAL_WAY_LIQUIDATION_RULES: Partial<Record<SurgicalWayType, SurgicalWayLiquidationRule>> = {
  "Misma especialidad - diferente vía": {
    additional: { medicalFees: 75, materials: 75, roomFee: 50 },
  },
  "Misma especialidad - única vía": {
    additional: { medicalFees: 50, materials: 0, roomFee: 0 },
  },
  "Misma especialidad - única vía - incruento": incruentRule(50),
  "Misma especialidad - diferente vía - incruento": incruentRule(75),
}

export function getSurgicalWayLiquidationPercentage(
  surgicalWayType: SurgicalWayType | null,
  conceptType: string,
  isFirstProcedure: boolean,
): number {
  const rule = surgicalWayType ? SURGICAL_WAY_LIQUIDATION_RULES[surgicalWayType] : undefined
  if (!rule) return DEFAULT_LIQUIDATION_PERCENTAGE

  const percentages = isFirstProcedure ? (rule.first ?? FULL_LIQUIDATION) : rule.additional

  if (MEDICAL_FEE_CONCEPT_TYPES.includes(conceptType as SurgicalConceptType)) return percentages.medicalFees
  if (conceptType === "MATERIALES") return percentages.materials
  if (conceptType === "DERECHO_SALA") return percentages.roomFee

  return DEFAULT_LIQUIDATION_PERCENTAGE
}

export function getSurgicalWayMaterialsCode(surgicalWayType: SurgicalWayType | null): number | undefined {
  return surgicalWayType ? SURGICAL_WAY_LIQUIDATION_RULES[surgicalWayType]?.materialsCode : undefined
}
