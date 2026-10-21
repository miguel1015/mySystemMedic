import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AplicacionOrdenRequest,
  AplicacionOrdenUpdateRequest,
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

// También tras un error (p. ej. cantidad cambiada por otro usuario) se recargan
// las cantidades para mostrar el estado real.
function useInvalidateAplicaciones() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY })
    queryClient.invalidateQueries({ queryKey: ["ordenes-medicas", "by-admission"] })
  }
}

export function useRegistrarAplicacion() {
  const invalidate = useInvalidateAplicaciones()

  return useMutation({
    mutationFn: (data: AplicacionOrdenRequest) =>
      create<OrdenActiva, AplicacionOrdenRequest>(ENDPOINTS.APLICACIONES_ORDENES.CREATE, data),
    onSettled: invalidate,
  })
}

export function useActualizarAplicacion() {
  const invalidate = useInvalidateAplicaciones()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AplicacionOrdenUpdateRequest }) =>
      updatePut<OrdenActiva, AplicacionOrdenUpdateRequest>(ENDPOINTS.APLICACIONES_ORDENES.UPDATE(id), data),
    onSettled: invalidate,
  })
}

export function useEliminarAplicacion() {
  const invalidate = useInvalidateAplicaciones()

  return useMutation({
    mutationFn: (id: number) => remove<OrdenActiva>(ENDPOINTS.APLICACIONES_ORDENES.DELETE(id)),
    onSettled: invalidate,
  })
}
