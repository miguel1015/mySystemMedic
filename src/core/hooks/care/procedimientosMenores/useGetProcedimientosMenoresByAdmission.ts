import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoMenorResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientosMenoresByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["procedimientos-menores", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<ProcedimientoMenorResponse[]>(
        ENDPOINTS.PROCEDIMIENTOS_MENORES.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
