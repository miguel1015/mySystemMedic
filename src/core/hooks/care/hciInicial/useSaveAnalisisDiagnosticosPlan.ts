import { create, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AnalisisDiagnosticosPlanHCInicialRequest,
  AnalisisDiagnosticosPlanHCInicialResponse,
} from "@/core/interfaces/care/hciInicial"
import { useMutation } from "@tanstack/react-query"

export const analisisDiagnosticosPlanHCInicialServices = {
  create: (data: AnalisisDiagnosticosPlanHCInicialRequest) =>
    create<
      AnalisisDiagnosticosPlanHCInicialResponse,
      AnalisisDiagnosticosPlanHCInicialRequest
    >(ENDPOINTS.ANALISIS_DIAGNOSTICOS_PLAN_HCINICIAL.CREATE, data),
  update: (
    id: number,
    data: AnalisisDiagnosticosPlanHCInicialRequest & { isActive: boolean },
  ) =>
    updatePut<
      AnalisisDiagnosticosPlanHCInicialResponse,
      AnalisisDiagnosticosPlanHCInicialRequest & { isActive: boolean }
    >(ENDPOINTS.ANALISIS_DIAGNOSTICOS_PLAN_HCINICIAL.UPDATE(id), data),
}

export function useCreateAnalisisDiagnosticosPlanHCInicial() {
  return useMutation({
    mutationFn: analisisDiagnosticosPlanHCInicialServices.create,
  })
}

export function useUpdateAnalisisDiagnosticosPlanHCInicial() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: AnalisisDiagnosticosPlanHCInicialRequest & { isActive: boolean }
    }) => analisisDiagnosticosPlanHCInicialServices.update(id, data),
  })
}
