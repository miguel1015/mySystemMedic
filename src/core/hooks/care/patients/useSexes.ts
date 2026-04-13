import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const sexesServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.SEXES),
}

export function useSexes() {
  return useQuery({
    queryKey: ["sexes"],
    queryFn: sexesServices.getAll,
  })
}
