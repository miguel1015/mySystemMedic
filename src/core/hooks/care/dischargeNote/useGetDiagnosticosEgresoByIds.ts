import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DiagnosticoEgresoResponse } from "@/core/interfaces/care/hciInicial"
import { useQueries } from "@tanstack/react-query"

export function useGetDiagnosticosEgresoByIds(ids: Array<number | null | undefined>) {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is number => !!id)))

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["diagnosticos-egreso", "detail", id],
      queryFn: () =>
        getById<DiagnosticoEgresoResponse>(ENDPOINTS.DIAGNOSTICOS_EGRESO.GET_BY_ID(id)),
      enabled: !!id,
    })),
  })

  const data = results
    .map((result) => result.data)
    .filter((d): d is DiagnosticoEgresoResponse => !!d)

  return {
    data,
    isLoading: results.some((result) => result.isLoading),
  }
}
