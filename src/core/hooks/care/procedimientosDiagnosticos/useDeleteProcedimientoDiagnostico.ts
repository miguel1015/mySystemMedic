import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useDeleteProcedimientoDiagnostico() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.PROCEDIMIENTOS_DIAGNOSTICOS.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-diagnosticos", "by-admission", String(variables.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-diagnosticos", "detail", variables.id],
      })
    },
  })
}
