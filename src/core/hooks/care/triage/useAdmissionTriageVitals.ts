import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetTriageById } from "@/core/hooks/care/triage/useGetTriageById"
import type { VitalSignsDto } from "@/core/interfaces/care/types"

// Signos vitales en el formato de los formularios clínicos. Un 0 (o "" en la TA)
// significa "sin dato": los campos lo muestran vacío para que se digite.
export interface ClinicalVitals {
  ta: string
  fc: number
  fr: number
  temperature: number
  saturation: number
  glasgow: number
  weight: number
  /** Talla en centímetros, igual que en el triage. */
  height: number
}

export const emptyClinicalVitals: ClinicalVitals = {
  ta: "",
  fc: 0,
  fr: 0,
  temperature: 0,
  saturation: 0,
  glasgow: 0,
  weight: 0,
  height: 0,
}

// El triage no registra la saturación de O₂, así que queda vacía.
export const vitalsFromTriage = (signos?: VitalSignsDto | null): ClinicalVitals => ({
  ta: signos?.tensionArterial?.trim() ?? "",
  fc: Number(signos?.frecuenciaCardiaca) || 0,
  fr: Number(signos?.frecuenciaRespiratoria) || 0,
  temperature: Number(signos?.temperatura) || 0,
  saturation: 0,
  glasgow: Number(signos?.glasgow) || 0,
  weight: Number(signos?.peso) || 0,
  height: Number(signos?.talla) || 0,
})

/**
 * Signos vitales del triage con el que se registró la admisión. Sirven para
 * precargar los formularios clínicos nuevos (HC inicial, evolución, egreso).
 */
export function useAdmissionTriageVitals(admissionId?: string | number | null) {
  const admission = useGetAdmissionById(admissionId)
  const triageId = admission.data?.triageId ?? null
  const triage = useGetTriageById(triageId)

  const isLoading = admission.isLoading || (!!triageId && triage.isLoading)
  // Resuelto: ya se sabe si hay triage (o que no lo hay / falló la consulta).
  const isResolved =
    !admissionId ||
    admission.isError ||
    (admission.isSuccess && (!triageId || triage.isSuccess || triage.isError))

  return {
    vitals: triage.data ? vitalsFromTriage(triage.data.signosVitales) : null,
    isLoading,
    isResolved,
  }
}
