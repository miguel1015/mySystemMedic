import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ClinicalHistorySearchBy,
  ClinicalHistorySearchResult,
  ClinicalRecordAudit,
  Especialidad,
} from "@/core/interfaces/care/clinicalHistory"

export interface ClinicalHistorySearchCriteria {
  by: ClinicalHistorySearchBy
  value: string
}

// null cuando no hay registros para el criterio (el backend responde 404).
export const clinicalHistorySearchService = async (
  criteria: ClinicalHistorySearchCriteria,
): Promise<ClinicalHistorySearchResult | null> => {
  const params = new URLSearchParams({ [criteria.by]: criteria.value }).toString()
  const res = await fetch(ENDPOINTS.CLINICAL_HISTORY.SEARCH(params), { credentials: "include" })
  if (res.status === 404) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? "No se pudo consultar la historia clínica.")
  return data as ClinicalHistorySearchResult
}

export function useSearchClinicalHistory(criteria: ClinicalHistorySearchCriteria | null) {
  return useQuery({
    queryKey: ["clinical-history", "search", criteria?.by, criteria?.value],
    queryFn: () => clinicalHistorySearchService(criteria!),
    enabled: !!criteria,
  })
}

// Modificaciones y eliminaciones registradas sobre la HC de una admisión.
export function useGetClinicalRecordAudits(admissionId?: number | null) {
  return useQuery({
    queryKey: ["clinical-history", "audits", admissionId],
    queryFn: () => getAll<ClinicalRecordAudit[]>(ENDPOINTS.CLINICAL_HISTORY.AUDITS(admissionId!)),
    enabled: !!admissionId,
  })
}

export function useGetEspecialidades() {
  return useQuery({
    queryKey: ["especialidades"],
    queryFn: () => getAll<Especialidad[]>(ENDPOINTS.ESPECIALIDADES.GET_ALL),
    staleTime: 30 * 60 * 1000,
  })
}
