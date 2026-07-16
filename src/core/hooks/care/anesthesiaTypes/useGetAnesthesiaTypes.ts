import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { AnesthesiaTypeResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetAnesthesiaTypes() {
  return useQuery({
    queryKey: ["anesthesia-types"],
    queryFn: () => getAll<AnesthesiaTypeResponse[]>(ENDPOINTS.ANESTHESIA_TYPES.SEARCH),
  })
}
