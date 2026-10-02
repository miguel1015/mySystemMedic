import { create, getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AplicacionOrdenRequest,
  OrdenActiva,
  ProfesionalAplicacion,
} from "@/core/interfaces/care/aplicacionOrden"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const BY_ADMISSION_KEY = ["aplicaciones-ordenes", "by-admission"]

export function useGetProfesionalesAplicacion() {
  return useQuery({
    queryKey: ["aplicaciones-ordenes", "profesionales"],
    queryFn: () =>
      getAll<ProfesionalAplicacion[]>(ENDPOINTS.APLICACIONES_ORDENES.PROFESIONALES),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetOrdenesParaAplicar(admissionId?: number | string) {
  return useQuery({
    queryKey: [...BY_ADMISSION_KEY, String(admissionId)],
    queryFn: () =>
      getAll<OrdenActiva[]>(ENDPOINTS.APLICACIONES_ORDENES.GET_BY_ADMISSION(admissionId!)),
    enabled: !!admissionId,
    // El estado "Vencida" depende de la hora: se refresca periódicamente.
    refetchInterval: 60 * 1000,
  })
}

export function useRegistrarAplicacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AplicacionOrdenRequest) =>
      create<OrdenActiva, AplicacionOrdenRequest>(ENDPOINTS.APLICACIONES_ORDENES.CREATE, data),
    onSettled: () => {
      // También tras un error (p. ej. cantidad cambiada por otro usuario) se
      // recargan las cantidades para mostrar el estado real.
      queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY })
      queryClient.invalidateQueries({ queryKey: ["ordenes-medicas", "by-admission"] })
    },
  })
}
