import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ProcedimientoMenorCreateRequest,
  ProcedimientoMenorResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const procedimientoMenorServices = {
  create: (data: ProcedimientoMenorCreateRequest) =>
    create<ProcedimientoMenorResponse, ProcedimientoMenorCreateRequest>(
      ENDPOINTS.PROCEDIMIENTOS_MENORES.CREATE,
      data,
    ),
}

export function useCreateProcedimientoMenor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: procedimientoMenorServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-menores", "by-admission", String(data.admissionId)],
      })
    },
  })
}
