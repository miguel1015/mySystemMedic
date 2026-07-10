import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { NotaMedicaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetNotasMedicasByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["notas-medicas", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<NotaMedicaResponse[]>(
        ENDPOINTS.NOTAS_MEDICAS.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
