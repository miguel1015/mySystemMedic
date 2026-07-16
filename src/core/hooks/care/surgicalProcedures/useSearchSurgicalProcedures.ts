import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { SurgicalProcedureResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export const surgicalProcedureServices = {
  search: (search: string) =>
    getAll<SurgicalProcedureResponse[]>(ENDPOINTS.SURGICAL_PROCEDURES.SEARCH, { params: { search } }),
}

export function useSearchSurgicalProcedures(search: string) {
  return useQuery({
    queryKey: ["surgical-procedures", search],
    queryFn: () => surgicalProcedureServices.search(search),
    enabled: search.length === 0 || search.length >= 2,
  })
}
