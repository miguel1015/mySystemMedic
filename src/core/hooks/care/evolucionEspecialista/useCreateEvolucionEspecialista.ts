import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EvolucionEspecialistaCreateRequest,
  EvolucionEspecialistaResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const evolucionEspecialistaServices = {
  create: (data: EvolucionEspecialistaCreateRequest) =>
    create<EvolucionEspecialistaResponse, EvolucionEspecialistaCreateRequest>(
      ENDPOINTS.EVOLUCION_ESPECIALISTAS.CREATE,
      data,
    ),
}

export function useCreateEvolucionEspecialista() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: evolucionEspecialistaServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["evolucion-especialistas", "by-admission", String(data.admissionId)],
      })
    },
  })
}
