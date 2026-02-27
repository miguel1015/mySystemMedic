import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicineGroup } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const medicineGroupsServices = {
  getAll: () => getAll<TMedicineGroup[]>(ENDPOINTS.MEDICINE_GROUPS.GET_ALL),
}

export function useMedicineGroups() {
  return useQuery({
    queryKey: ["medicine-groups"],
    queryFn: medicineGroupsServices.getAll,
  })
}
