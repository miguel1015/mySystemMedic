import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { EvolucionEspecialistaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetEvolucionEspecialistasByAdmission(
  admissionId?: number | string,
) {
  return useQuery({
    queryKey: ["evolucion-especialistas", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<EvolucionEspecialistaResponse[]>(
        ENDPOINTS.EVOLUCION_ESPECIALISTAS.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
