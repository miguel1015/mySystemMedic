import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { ProcedimientoDiagnosticoResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetProcedimientosDiagnosticosByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["procedimientos-diagnosticos", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<ProcedimientoDiagnosticoResponse[]>(
        ENDPOINTS.PROCEDIMIENTOS_DIAGNOSTICOS.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
