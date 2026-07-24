import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { DescripcionQuirurgicaResponse } from "@/core/interfaces/care/hciInicial"
import { useQuery } from "@tanstack/react-query"

export function useGetDescripcionQuirurgicaById(id?: number | string | null) {
  return useQuery({
    queryKey: ["descripciones-quirurgicas", "detail", id],
    queryFn: () =>
      getById<DescripcionQuirurgicaResponse>(ENDPOINTS.DESCRIPCIONES_QUIRURGICAS.GET_BY_ID(id!)),
    enabled: !!id,
  })
}
