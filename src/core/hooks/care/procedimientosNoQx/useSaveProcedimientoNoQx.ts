import { create, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ProcedimientoNoQxCreateRequest,
  ProcedimientoNoQxResponse,
  ProcedimientoNoQxUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const procedimientoNoQxServices = {
  create: (data: ProcedimientoNoQxCreateRequest) =>
    create<ProcedimientoNoQxResponse, ProcedimientoNoQxCreateRequest>(
      ENDPOINTS.PROCEDIMIENTOS_NO_QX.CREATE,
      data,
    ),
  update: (id: number, data: ProcedimientoNoQxUpdateRequest) =>
    updatePut<ProcedimientoNoQxResponse, ProcedimientoNoQxUpdateRequest>(
      ENDPOINTS.PROCEDIMIENTOS_NO_QX.UPDATE(id),
      data,
    ),
  delete: (id: number) =>
    remove<ProcedimientoNoQxResponse>(ENDPOINTS.PROCEDIMIENTOS_NO_QX.DELETE(id)),
}

export function useCreateProcedimientoNoQx() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: procedimientoNoQxServices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-no-qx", "by-admission"],
      })
    },
  })
}

export function useUpdateProcedimientoNoQx() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcedimientoNoQxUpdateRequest }) =>
      procedimientoNoQxServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-no-qx", "by-admission"],
      })
    },
  })
}

export function useDeleteProcedimientoNoQx() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => procedimientoNoQxServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["procedimientos-no-qx", "by-admission"],
      })
    },
  })
}
