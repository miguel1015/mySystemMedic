import { create, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  HCInicialCreateRequest,
  HCInicialResponse,
  HCInicialUpdateRequest,
} from "@/core/interfaces/care/hciInicial"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const hcInicialServices = {
  create: (data: HCInicialCreateRequest) =>
    create<HCInicialResponse, HCInicialCreateRequest>(
      ENDPOINTS.HCINICIAL.CREATE,
      data,
    ),
  update: (id: number, data: HCInicialUpdateRequest) =>
    updatePut<HCInicialResponse, HCInicialUpdateRequest>(
      ENDPOINTS.HCINICIAL.UPDATE(id),
      data,
    ),
  delete: (id: number) =>
    remove<HCInicialResponse>(ENDPOINTS.HCINICIAL.DELETE(id)),
}

export function useCreateHCInicial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: hcInicialServices.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["hci-inicial", "by-admission", data.admissionId],
      })
    },
  })
}

export function useUpdateHCInicial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HCInicialUpdateRequest }) =>
      hcInicialServices.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["hci-inicial", "by-admission", data.admissionId],
      })
    },
  })
}

export function useDeleteHCInicial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => hcInicialServices.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["hci-inicial", "by-admission", data.admissionId],
      })
    },
  })
}
