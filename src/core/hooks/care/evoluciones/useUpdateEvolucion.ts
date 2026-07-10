import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EvolucionResponse,
  EvolucionUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const evolucionUpdateService = (
  id: number,
  data: EvolucionUpdateRequest,
) =>
  updatePut<EvolucionResponse, EvolucionUpdateRequest>(
    ENDPOINTS.EVOLUCIONES.UPDATE(id),
    data,
  )

export function useUpdateEvolucion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EvolucionUpdateRequest }) =>
      evolucionUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["evoluciones", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["evoluciones", "detail", data.id],
      })
    },
  })
}
