import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TPresentation } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const presentationsServices = {
  getAll: () => getAll<TPresentation[]>(ENDPOINTS.PRESENTATIONS.GET_ALL),
}

export function usePresentations() {
  return useQuery({
    queryKey: ["presentations"],
    queryFn: presentationsServices.getAll,
  })
}
