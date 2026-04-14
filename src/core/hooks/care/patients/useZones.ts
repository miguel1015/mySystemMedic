import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const zonesServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.ZONES),
}

export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: zonesServices.getAll,
  })
}
