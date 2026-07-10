import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ProcedimientoMenorResponse,
  ProcedimientoMenorUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const procedimientoMenorUpdateService = (
  id: number,
  data: ProcedimientoMenorUpdateRequest,
) =>
  updatePut<ProcedimientoMenorResponse, ProcedimientoMenorUpdateRequest>(
    ENDPOINTS.PROCEDIMIENTOS_MENORES.UPDATE(id),
    data,
  )

export function useUpdateProcedimientoMenor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcedimientoMenorUpdateRequest }) =>
      procedimientoMenorUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-menores", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-menores", "detail", data.id],
      })
    },
  })
}
