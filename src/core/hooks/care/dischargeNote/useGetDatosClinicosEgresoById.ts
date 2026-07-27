import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DatosClinicosEgresoResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetDatosClinicosEgresoById(id?: number | string | null) {
  return useQuery({
    queryKey: ["datos-clinicos-egreso", "detail", id],
    queryFn: () =>
      getById<DatosClinicosEgresoResponse>(ENDPOINTS.DATOS_CLINICOS_EGRESO.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
