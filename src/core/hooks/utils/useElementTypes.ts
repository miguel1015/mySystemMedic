import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TElementCatalog } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const elementTypesServices = {
  getAll: () => getAll<TElementCatalog[]>(ENDPOINTS.ELEMENT_TYPES.GET_ALL),
}

export function useElementTypes() {
  return useQuery({
    queryKey: ["element-types"],
    queryFn: elementTypesServices.getAll,
  })
}
