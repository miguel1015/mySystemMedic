import { create, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  SignosVitalesHCInicialRequest,
  SignosVitalesHCInicialResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation } from "@tanstack/react-query"

export const signosVitalesHCInicialServices = {
  create: (data: SignosVitalesHCInicialRequest) =>
    create<SignosVitalesHCInicialResponse, SignosVitalesHCInicialRequest>(
      ENDPOINTS.SIGNOS_VITALES_HCINICIAL.CREATE,
      data,
    ),
  update: (
    id: number,
    data: SignosVitalesHCInicialRequest & { isActive: boolean },
  ) =>
    updatePut<
      SignosVitalesHCInicialResponse,
      SignosVitalesHCInicialRequest & { isActive: boolean }
    >(ENDPOINTS.SIGNOS_VITALES_HCINICIAL.UPDATE(id), data),
}

export function useCreateSignosVitalesHCInicial() {
  return useMutation({
    mutationFn: signosVitalesHCInicialServices.create,
  })
}

export function useUpdateSignosVitalesHCInicial() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SignosVitalesHCInicialRequest & { isActive: boolean }
    }) => signosVitalesHCInicialServices.update(id, data),
  })
}
