import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EvolucionCreateRequest,
  EvolucionResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const evolucionServices = {
  create: (data: EvolucionCreateRequest) =>
    create<EvolucionResponse, EvolucionCreateRequest>(
      ENDPOINTS.EVOLUCIONES.CREATE,
      data,
    ),
}

export function useCreateEvolucion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: evolucionServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["evoluciones", "by-admission", data.admissionId],
      })
    },
  })
}
