import { create, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  ObjetivoHCInicialRequest,
  ObjetivoHCInicialResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation } from "@tanstack/react-query"

export const objetivoHCInicialServices = {
  create: (data: ObjetivoHCInicialRequest) =>
    create<ObjetivoHCInicialResponse, ObjetivoHCInicialRequest>(
      ENDPOINTS.OBJETIVO_HCINICIAL.CREATE,
      data,
    ),
  update: (id: number, data: ObjetivoHCInicialRequest & { isActive: boolean }) =>
    updatePut<ObjetivoHCInicialResponse, ObjetivoHCInicialRequest & { isActive: boolean }>(
      ENDPOINTS.OBJETIVO_HCINICIAL.UPDATE(id),
      data,
    ),
}

export function useCreateObjetivoHCInicial() {
  return useMutation({
    mutationFn: objetivoHCInicialServices.create,
  })
}

export function useUpdateObjetivoHCInicial() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: ObjetivoHCInicialRequest & { isActive: boolean }
    }) => objetivoHCInicialServices.update(id, data),
  })
}
