import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const maritalStatusesServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.MARITAL_STATUSES),
}

export function useMaritalStatuses() {
  return useQuery({
    queryKey: ["marital-statuses"],
    queryFn: maritalStatusesServices.getAll,
  })
}
