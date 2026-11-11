import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EstudioRayosXCreateRequest,
  EstudioRayosXResponse,
  EstudioRayosXUpdateRequest,
  OrdenRayosXPendiente,
} from "@/core/interfaces/care/rayosX"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const byAdmissionKey = (admissionId?: number | string) => [
  "estudios-rayos-x",
  "by-admission",
  String(admissionId),
]

const ORDENES_PENDIENTES_KEY = ["estudios-rayos-x", "ordenes-pendientes"]

export function useGetEstudiosRayosXByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: byAdmissionKey(admissionId),
    queryFn: () =>
      getAll<EstudioRayosXResponse[]>(
        ENDPOINTS.ESTUDIOS_RAYOS_X.GET_BY_ADMISSION(admissionId!),
      ),
    enabled: !!admissionId,
  })
}

// Órdenes de rayos X de la admisión que aún no tienen estudio.
export function useGetOrdenesRayosXPendientes(admissionId?: number | string) {
  return useQuery({
    queryKey: [...ORDENES_PENDIENTES_KEY, String(admissionId)],
    queryFn: () =>
      getAll<OrdenRayosXPendiente[]>(
        ENDPOINTS.ESTUDIOS_RAYOS_X.ORDENES_PENDIENTES(admissionId!),
      ),
    enabled: !!admissionId,
    // Las órdenes llegan desde otro módulo: se refresca para ver las nuevas.
    refetchInterval: 60 * 1000,
  })
}

// Realizar o anular un estudio con orden cambia el estado de la orden médica y la
// hoja de gastos, que se muestran en otros módulos.
function useInvalidateOrdenes() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ORDENES_PENDIENTES_KEY })
    queryClient.invalidateQueries({ queryKey: ["ordenes-medicas", "by-admission"] })
  }
}

export function useCreateEstudioRayosX() {
  const queryClient = useQueryClient()
  const invalidateOrdenes = useInvalidateOrdenes()

  return useMutation({
    mutationFn: (data: EstudioRayosXCreateRequest) =>
      create<EstudioRayosXResponse, EstudioRayosXCreateRequest>(
        ENDPOINTS.ESTUDIOS_RAYOS_X.CREATE,
        data,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(data.admissionId) })
    },
    // También tras un error: la orden pudo realizarse o suspenderse en otro lado.
    onSettled: (_data, _error, variables) => {
      if (variables.ordenMedicaItemId) invalidateOrdenes()
    },
  })
}

export function useUpdateEstudioRayosX() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EstudioRayosXUpdateRequest }) =>
      updatePut<EstudioRayosXResponse, EstudioRayosXUpdateRequest>(
        ENDPOINTS.ESTUDIOS_RAYOS_X.UPDATE(id),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estudios-rayos-x", "by-admission"] })
    },
  })
}

export function useDeleteEstudioRayosX() {
  const queryClient = useQueryClient()
  const invalidateOrdenes = useInvalidateOrdenes()

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string; conOrden?: boolean }) =>
      remove<{ ok: boolean }>(ENDPOINTS.ESTUDIOS_RAYOS_X.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(variables.admissionId) })
      if (variables.conOrden) invalidateOrdenes()
    },
  })
}
