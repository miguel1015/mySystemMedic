import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DescripcionQuirurgicaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetDescripcionQuirurgicaByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: ["descripciones-quirurgicas", "by-admission", String(admissionId)],
    queryFn: () =>
      getAll<DescripcionQuirurgicaResponse[]>(
        ENDPOINTS.DESCRIPCIONES_QUIRURGICAS.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}
