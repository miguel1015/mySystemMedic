import { create, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  SubjetivoHCInicialRequest,
  SubjetivoHCInicialResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation } from "@tanstack/react-query"

export const subjetivoHCInicialServices = {
  create: (data: SubjetivoHCInicialRequest) =>
    create<SubjetivoHCInicialResponse, SubjetivoHCInicialRequest>(
      ENDPOINTS.SUBJETIVO_HCINICIAL.CREATE,
      data,
    ),
  update: (id: number, data: SubjetivoHCInicialRequest & { isActive: boolean }) =>
    updatePut<SubjetivoHCInicialResponse, SubjetivoHCInicialRequest & { isActive: boolean }>(
      ENDPOINTS.SUBJETIVO_HCINICIAL.UPDATE(id),
      data,
    ),
}

export function useCreateSubjetivoHCInicial() {
  return useMutation({
    mutationFn: subjetivoHCInicialServices.create,
  })
}

export function useUpdateSubjetivoHCInicial() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SubjetivoHCInicialRequest & { isActive: boolean }
    }) => subjetivoHCInicialServices.update(id, data),
  })
}
