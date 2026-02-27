import { useQuery } from "@tanstack/react-query"
import { getAll } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicine } from "../../../interfaces/parameterization/types"

export const medicinesServices = {
  getAll: () => getAll<TMedicine[]>(ENDPOINTS.MEDICINES.GET_ALL),
}

export function useMedicines() {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: medicinesServices.getAll,
  })
}
