import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  NotaMedicaCreateRequest,
  NotaMedicaResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const notaMedicaServices = {
  create: (data: NotaMedicaCreateRequest) =>
    create<NotaMedicaResponse, NotaMedicaCreateRequest>(
      ENDPOINTS.NOTAS_MEDICAS.CREATE,
      data,
    ),
}

export function useCreateNotaMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notaMedicaServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notas-medicas", "by-admission", String(data.admissionId)],
      })
    },
  })
}
