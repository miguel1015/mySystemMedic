import { create, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  NotaEnfermeriaCreateRequest,
  NotaEnfermeriaResponse,
  NotaEnfermeriaUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const notaEnfermeriaServices = {
  create: (data: NotaEnfermeriaCreateRequest) =>
    create<NotaEnfermeriaResponse, NotaEnfermeriaCreateRequest>(
      ENDPOINTS.NOTAS_ENFERMERIA.CREATE,
      data,
    ),
  update: (id: number, data: NotaEnfermeriaUpdateRequest) =>
    updatePut<NotaEnfermeriaResponse, NotaEnfermeriaUpdateRequest>(
      ENDPOINTS.NOTAS_ENFERMERIA.UPDATE(id),
      data,
    ),
  delete: (id: number) =>
    remove<NotaEnfermeriaResponse>(ENDPOINTS.NOTAS_ENFERMERIA.DELETE(id)),
}

export function useCreateNotaEnfermeria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notaEnfermeriaServices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notas-enfermeria", "by-admission"],
      })
    },
  })
}

export function useUpdateNotaEnfermeria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NotaEnfermeriaUpdateRequest }) =>
      notaEnfermeriaServices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notas-enfermeria", "by-admission"],
      })
    },
  })
}

export function useDeleteNotaEnfermeria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) => notaEnfermeriaServices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notas-enfermeria", "by-admission"],
      })
    },
  })
}
