import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoNoQxResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientoNoQxById(id?: number | string | null) {
  return useQuery({
    queryKey: ["procedimientos-no-qx", "detail", id],
    queryFn: () =>
      getById<ProcedimientoNoQxResponse>(ENDPOINTS.PROCEDIMIENTOS_NO_QX.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
