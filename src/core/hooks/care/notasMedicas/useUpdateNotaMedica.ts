import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  NotaMedicaResponse,
  NotaMedicaUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const notaMedicaUpdateService = (
  id: number,
  data: NotaMedicaUpdateRequest,
) =>
  updatePut<NotaMedicaResponse, NotaMedicaUpdateRequest>(
    ENDPOINTS.NOTAS_MEDICAS.UPDATE(id),
    data,
  )

export function useUpdateNotaMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NotaMedicaUpdateRequest }) =>
      notaMedicaUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notas-medicas", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["notas-medicas", "detail", data.id],
      })
    },
  })
}
