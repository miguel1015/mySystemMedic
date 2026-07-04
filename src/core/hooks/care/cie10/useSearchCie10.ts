import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { Cie10CodeResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export type Cie10Item = Cie10CodeResponse

export const cie10Services = {
  search: (search: string) =>
    getAll<Cie10Item[]>(ENDPOINTS.CIE10.SEARCH, { params: { search } }),
}

export function useSearchCie10(search: string) {
  return useQuery({
    queryKey: ["cie10", search],
    queryFn: () => cie10Services.search(search),
    enabled: search.length === 0 || search.length >= 2,
  })
}
