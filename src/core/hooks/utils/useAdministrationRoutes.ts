import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TAdministrationRoute } from "@/core/interfaces/parameterization/types"
import { useQuery } from "@tanstack/react-query"

export const administrationRoutesServices = {
  getAll: () =>
    getAll<TAdministrationRoute[]>(ENDPOINTS.ADMINISTRATION_ROUTES.GET_ALL),
}

export function useAdministrationRoutes() {
  return useQuery({
    queryKey: ["administration-routes"],
    queryFn: administrationRoutesServices.getAll,
  })
}
