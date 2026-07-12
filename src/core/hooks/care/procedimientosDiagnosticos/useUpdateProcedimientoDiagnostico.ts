import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ProcedimientoDiagnosticoResponse,
  ProcedimientoDiagnosticoUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const procedimientoDiagnosticoUpdateService = (
  id: number,
  data: ProcedimientoDiagnosticoUpdateRequest,
) =>
  updatePut<ProcedimientoDiagnosticoResponse, ProcedimientoDiagnosticoUpdateRequest>(
    ENDPOINTS.PROCEDIMIENTOS_DIAGNOSTICOS.UPDATE(id),
    data,
  )

export function useUpdateProcedimientoDiagnostico() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcedimientoDiagnosticoUpdateRequest }) =>
      procedimientoDiagnosticoUpdateService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-diagnosticos", "by-admission", String(data.admissionId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-diagnosticos", "detail", data.id],
      })
    },
  })
}
