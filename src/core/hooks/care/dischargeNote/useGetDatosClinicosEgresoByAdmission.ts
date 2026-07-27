import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DatosClinicosEgresoResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetDatosClinicosEgresoByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["datos-clinicos-egreso", "by-admission", admissionId],
    queryFn: () =>
      getAll<DatosClinicosEgresoResponse[]>(
        ENDPOINTS.DATOS_CLINICOS_EGRESO.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
