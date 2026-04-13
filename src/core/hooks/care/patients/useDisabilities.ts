import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const disabilitiesServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.DISABILITIES),
}

export function useDisabilities() {
  return useQuery({
    queryKey: ["disabilities"],
    queryFn: disabilitiesServices.getAll,
  })
}
