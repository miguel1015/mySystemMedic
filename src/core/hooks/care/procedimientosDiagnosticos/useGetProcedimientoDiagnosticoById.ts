import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoDiagnosticoResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientoDiagnosticoById(id?: number | string | null) {
  return useQuery({
    queryKey: ["procedimientos-diagnosticos", "detail", id],
    queryFn: () =>
      getById<ProcedimientoDiagnosticoResponse>(ENDPOINTS.PROCEDIMIENTOS_DIAGNOSTICOS.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
