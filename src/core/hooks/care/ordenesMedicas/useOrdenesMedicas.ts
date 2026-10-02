import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AsistencialOrden,
  ConceptoOrden,
  OrdenMedica,
  OrdenMedicaRequest,
  TipoOrden,
  UnidadMedida,
  ViaAdministracion,
} from "@/core/interfaces/care/ordenMedica"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const BY_ADMISSION_KEY = ["ordenes-medicas", "by-admission"]

export function useGetAsistencialesOrden() {
  return useQuery({
    queryKey: ["ordenes-medicas", "asistenciales"],
    queryFn: () => getAll<AsistencialOrden[]>(ENDPOINTS.ORDENES_MEDICAS.ASISTENCIALES),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetViasAdministracion() {
  return useQuery({
    queryKey: ["ordenes-medicas", "vias"],
    queryFn: () => getAll<ViaAdministracion[]>(ENDPOINTS.ORDENES_MEDICAS.VIAS),
    staleTime: 30 * 60 * 1000,
  })
}

export function useGetUnidadesMedida() {
  return useQuery({
    queryKey: ["ordenes-medicas", "unidades"],
    queryFn: () => getAll<UnidadMedida[]>(ENDPOINTS.ORDENES_MEDICAS.UNIDADES),
    staleTime: 30 * 60 * 1000,
  })
}

export function useBuscarConceptosOrden(search: string, tipoOrden?: TipoOrden) {
  const term = search.trim()

  return useQuery({
    queryKey: ["ordenes-medicas", "conceptos", term, tipoOrden ?? "todos"],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (term) params.search = term
      if (tipoOrden) params.tipoOrden = tipoOrden
      return getAll<ConceptoOrden[]>(ENDPOINTS.ORDENES_MEDICAS.CONCEPTOS, { params })
    },
    // Sin texto ni tipo el backend no devuelve nada; se evita la llamada.
    enabled: term.length > 0 || !!tipoOrden,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}

export function useGetOrdenesMedicasByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: [...BY_ADMISSION_KEY, String(admissionId)],
    queryFn: () =>
      getAll<OrdenMedica[]>(ENDPOINTS.ORDENES_MEDICAS.GET_BY_ADMISSION(admissionId!)),
    enabled: !!admissionId,
  })
}

export function useCrearOrdenMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrdenMedicaRequest) =>
      create<OrdenMedica, OrdenMedicaRequest>(ENDPOINTS.ORDENES_MEDICAS.CREATE, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}

export function useActualizarOrdenMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrdenMedicaRequest }) =>
      updatePut<OrdenMedica, OrdenMedicaRequest>(ENDPOINTS.ORDENES_MEDICAS.UPDATE(id), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}

export function useAnularOrdenMedica() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      remove<{ ok: boolean }>(ENDPOINTS.ORDENES_MEDICAS.DELETE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}
