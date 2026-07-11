import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoNoQxResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientosNoQxByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["procedimientos-no-qx", "by-admission", admissionId],
    queryFn: () =>
      getAll<ProcedimientoNoQxResponse[]>(
        ENDPOINTS.PROCEDIMIENTOS_NO_QX.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
