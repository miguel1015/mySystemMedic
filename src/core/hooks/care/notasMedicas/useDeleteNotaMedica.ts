import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteNotaMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.NOTAS_MEDICAS.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notas-medicas", "by-admission", String(variables.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["notas-medicas", "detail", variables.id],
      })
    },
  })
}
