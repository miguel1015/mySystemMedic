import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

export interface Cie10Item {
  cod4: string
  descripcionCodigoCuatroCaracteres: string
}

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
