import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetDiagnosticoEgresoById(id?: number | string | null) {
  return useQuery({
    queryKey: ["diagnosticos-egreso", "detail", id],
    queryFn: () =>
      getById<DiagnosticoEgresoResponse>(ENDPOINTS.DIAGNOSTICOS_EGRESO.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
