import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EvolucionEspecialistaResponse,
  EvolucionEspecialistaUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const evolucionEspecialistaUpdateService = (
  id: number,
  data: EvolucionEspecialistaUpdateRequest,
) =>
  updatePut<EvolucionEspecialistaResponse, EvolucionEspecialistaUpdateRequest>(
    ENDPOINTS.EVOLUCION_ESPECIALISTAS.UPDATE(id),
    data,
  )

export function useUpdateEvolucionEspecialista() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EvolucionEspecialistaUpdateRequest }) =>
      evolucionEspecialistaUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["evolucion-especialistas", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["evolucion-especialistas", "detail", data.id],
      })

    },
  })
}
