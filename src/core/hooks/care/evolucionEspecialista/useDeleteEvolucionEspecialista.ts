import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteEvolucionEspecialista() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.EVOLUCION_ESPECIALISTAS.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evolucion-especialistas", "by-admission", String(variables.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["evolucion-especialistas", "detail", variables.id],
      })
    },
  })
}
