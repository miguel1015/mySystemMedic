import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  DescripcionQuirurgicaResponse,
  DescripcionQuirurgicaUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const descripcionQuirurgicaUpdateService = (
  id: number,
  data: DescripcionQuirurgicaUpdateRequest,
) =>
  updatePut<DescripcionQuirurgicaResponse, DescripcionQuirurgicaUpdateRequest>(
    ENDPOINTS.DESCRIPCIONES_QUIRURGICAS.UPDATE(id),
    data,
  )

export function useUpdateDescripcionQuirurgica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DescripcionQuirurgicaUpdateRequest }) =>
      descripcionQuirurgicaUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["descripciones-quirurgicas", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["descripciones-quirurgicas", "detail", data.id],
      })
    },
  })
}
