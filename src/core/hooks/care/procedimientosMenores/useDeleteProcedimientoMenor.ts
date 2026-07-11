import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteProcedimientoMenor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.PROCEDIMIENTOS_MENORES.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-menores", "by-admission", String(variables.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-menores", "detail", variables.id],
      })
    },
  })
}
