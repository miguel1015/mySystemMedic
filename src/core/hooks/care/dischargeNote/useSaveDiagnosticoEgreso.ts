import { create, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  DiagnosticoEgresoCreateRequest,
  DiagnosticoEgresoResponse,
  DiagnosticoEgresoUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const diagnosticoEgresoServices = {
  create: (data: DiagnosticoEgresoCreateRequest) =>
    create<DiagnosticoEgresoResponse, DiagnosticoEgresoCreateRequest>(
      ENDPOINTS.DIAGNOSTICOS_EGRESO.CREATE,
      data,
    ),
  update: (id: number, data: DiagnosticoEgresoUpdateRequest) =>
    updatePut<DiagnosticoEgresoResponse, DiagnosticoEgresoUpdateRequest>(
      ENDPOINTS.DIAGNOSTICOS_EGRESO.UPDATE(id),
      data,
    ),
  delete: (id: number) =>
    remove<{ ok: boolean }>(ENDPOINTS.DIAGNOSTICOS_EGRESO.DELETE(id)),
}

export function useCreateDiagnosticoEgreso() {
  return useMutation({
    mutationFn: diagnosticoEgresoServices.create,
  })
}

export function useUpdateDiagnosticoEgreso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DiagnosticoEgresoUpdateRequest }) =>
      diagnosticoEgresoServices.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["diagnosticos-egreso", "detail", data.id],
      })
    },
  })
}

export function useDeleteDiagnosticoEgreso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => diagnosticoEgresoServices.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["diagnosticos-egreso", "detail", variables.id],
      })
    },
  })
}
