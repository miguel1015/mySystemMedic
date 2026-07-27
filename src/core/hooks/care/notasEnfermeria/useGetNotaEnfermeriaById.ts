import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { NotaEnfermeriaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetNotaEnfermeriaById(id?: number | string | null) {
  return useQuery({
    queryKey: ["notas-enfermeria", "detail", id],
    queryFn: () =>
      getById<NotaEnfermeriaResponse>(ENDPOINTS.NOTAS_ENFERMERIA.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
