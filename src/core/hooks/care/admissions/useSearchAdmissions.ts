import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { AdmissionResponse } from "@/core/interfaces/care/types"

// Un solo criterio por búsqueda. Sin `soloActivas` el backend devuelve también las
// cerradas (historial del paciente).
export type AdmissionSearchCriteria = (
  | { numero: number }
  | { documento: string }
  | { patientId: number }
) & { soloActivas?: boolean }

export const admissionSearchService = {
  search: (criteria: AdmissionSearchCriteria) =>
    getAll<AdmissionResponse[]>(
      ENDPOINTS.ADMISSIONS.SEARCH(
        new URLSearchParams(
          Object.entries(criteria).map(([key, value]) => [key, String(value)]),
        ).toString(),
      ),
    ),
}

export function useSearchAdmissions(criteria: AdmissionSearchCriteria | null) {
  return useQuery({
    queryKey: ["admissions", "search", criteria],
    queryFn: () => admissionSearchService.search(criteria!),
    enabled: !!criteria,
  })
}
