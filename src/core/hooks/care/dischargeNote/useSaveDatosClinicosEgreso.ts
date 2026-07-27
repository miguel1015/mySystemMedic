import { create, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  DatosClinicosEgresoCreateRequest,
  DatosClinicosEgresoResponse,
  DatosClinicosEgresoUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const datosClinicosEgresoServices = {
  create: (data: DatosClinicosEgresoCreateRequest) =>
    create<DatosClinicosEgresoResponse, DatosClinicosEgresoCreateRequest>(
      ENDPOINTS.DATOS_CLINICOS_EGRESO.CREATE,
      data,
    ),
  update: (id: number, data: DatosClinicosEgresoUpdateRequest) =>
    updatePut<DatosClinicosEgresoResponse, DatosClinicosEgresoUpdateRequest>(
      ENDPOINTS.DATOS_CLINICOS_EGRESO.UPDATE(id),
      data,
    ),
  delete: (id: number) =>
    remove<{ ok: boolean }>(ENDPOINTS.DATOS_CLINICOS_EGRESO.DELETE(id)),
}

export function useCreateDatosClinicosEgreso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: datosClinicosEgresoServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["datos-clinicos-egreso", "by-admission", String(data.admissionId)],
      })
    },
  })
}

export function useUpdateDatosClinicosEgreso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DatosClinicosEgresoUpdateRequest }) =>
      datosClinicosEgresoServices.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["datos-clinicos-egreso", "detail", data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["datos-clinicos-egreso", "by-admission", String(data.admissionId)],
      })
    },
  })
}

export function useDeleteDatosClinicosEgreso() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      datosClinicosEgresoServices.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["datos-clinicos-egreso", "detail", variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["datos-clinicos-egreso", "by-admission", String(variables.admissionId)],
      })
    },
  })
}
