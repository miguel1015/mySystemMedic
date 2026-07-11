import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { NotaMedicaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetNotaMedicaById(id?: number | string | null) {
  return useQuery({
    queryKey: ["notas-medicas", "detail", id],
    queryFn: () =>
      getById<NotaMedicaResponse>(ENDPOINTS.NOTAS_MEDICAS.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
