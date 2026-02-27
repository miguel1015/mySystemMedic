import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TProvider } from "../../../interfaces/parameterization/types"
import { getById } from "../../../api/baseService"

export const providerService = {
  getById: (id: string | number) =>
    getById<TProvider>(ENDPOINTS.PROVIDERS.GET_BY_ID(id)),
}

export function useGetProvider(id: string | number) {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: () => providerService.getById(id),
    enabled: !!id,
  })
}
