import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { NotaEnfermeriaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetNotasEnfermeriaByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["notas-enfermeria", "by-admission", admissionId],
    queryFn: () =>
      getAll<NotaEnfermeriaResponse[]>(
        ENDPOINTS.NOTAS_ENFERMERIA.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
