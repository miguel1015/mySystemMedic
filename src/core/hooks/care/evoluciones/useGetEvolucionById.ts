import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { EvolucionResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetEvolucionById(id?: number | string | null) {
  return useQuery({
    queryKey: ["evoluciones", "detail", id],
    queryFn: () =>
      getById<EvolucionResponse>(ENDPOINTS.EVOLUCIONES.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
