import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TElementCatalog } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const elementUsagesServices = {
  getAll: () => getAll<TElementCatalog[]>(ENDPOINTS.ELEMENT_USAGES.GET_ALL),
}

export function useElementUsages() {
  return useQuery({
    queryKey: ["element-usages"],
    queryFn: elementUsagesServices.getAll,
  })
}
