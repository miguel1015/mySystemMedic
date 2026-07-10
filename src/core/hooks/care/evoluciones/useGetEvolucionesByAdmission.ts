import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { EvolucionResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetEvolucionesByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["evoluciones", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<EvolucionResponse[]>(
        ENDPOINTS.EVOLUCIONES.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
