import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteEvolucion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.EVOLUCIONES.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evoluciones", "by-admission", String(variables.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["evoluciones", "detail", variables.id],
      })
    },
  })
}
