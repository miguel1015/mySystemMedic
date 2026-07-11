import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { EvolucionEspecialistaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetEvolucionEspecialistaById(id?: number | string | null) {
  return useQuery({
    queryKey: ["evolucion-especialistas", "detail", id],
    queryFn: () =>
      getById<EvolucionEspecialistaResponse>(
        ENDPOINTS.EVOLUCION_ESPECIALISTAS.GET_BY_ID(id!),
      ),
    enabled: !!id,
  })
}
