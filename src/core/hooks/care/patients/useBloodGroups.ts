import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { PatientCatalog } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

export const bloodGroupsServices = {
  getAll: () => getAll<PatientCatalog[]>(ENDPOINTS.PATIENT_CATALOGS.BLOOD_GROUPS),
}

export function useBloodGroups() {
  return useQuery({
    queryKey: ["blood-groups"],
    queryFn: bloodGroupsServices.getAll,
  })
}
