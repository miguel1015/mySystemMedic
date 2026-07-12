import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ProcedimientoDiagnosticoCreateRequest,
  ProcedimientoDiagnosticoResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const procedimientoDiagnosticoServices = {
  create: (data: ProcedimientoDiagnosticoCreateRequest) =>
    create<ProcedimientoDiagnosticoResponse, ProcedimientoDiagnosticoCreateRequest>(
      ENDPOINTS.PROCEDIMIENTOS_DIAGNOSTICOS.CREATE,
      data,
    ),
}

export function useCreateProcedimientoDiagnostico() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: procedimientoDiagnosticoServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-diagnosticos", "by-admission", String(data.admissionId)],
      })
    },
  })
}
