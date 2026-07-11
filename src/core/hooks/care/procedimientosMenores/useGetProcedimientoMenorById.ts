import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoMenorResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientoMenorById(id?: number | string | null) {
  return useQuery({
    queryKey: ["procedimientos-menores", "detail", id],
    queryFn: () =>
      getById<ProcedimientoMenorResponse>(ENDPOINTS.PROCEDIMIENTOS_MENORES.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
