import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const rhFactorsServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.RH_FACTORS),
}

export function useRhFactors() {
  return useQuery({
    queryKey: ["rh-factors"],
    queryFn: rhFactorsServices.getAll,
  })
}
