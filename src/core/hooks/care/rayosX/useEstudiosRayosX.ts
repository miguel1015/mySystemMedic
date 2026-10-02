import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  EstudioRadiologicoDisponible,
  EstudioRayosXCreateRequest,
  EstudioRayosXResponse,
  EstudioRayosXUpdateRequest,
} from "@/core/interfaces/care/rayosX"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const byAdmissionKey = (admissionId?: number | string) => [
  "estudios-rayos-x",
  "by-admission",
  String(admissionId),
]

export function useGetEstudiosRadiologicosDisponibles() {
  return useQuery({
    queryKey: ["estudios-rayos-x", "estudios-disponibles"],
    queryFn: () =>
      getAll<EstudioRadiologicoDisponible[]>(ENDPOINTS.ESTUDIOS_RAYOS_X.ESTUDIOS_DISPONIBLES),
    staleTime: 10 * 60 * 1000,
  })
}

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

export function useCreateEstudioRayosX() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EstudioRayosXCreateRequest) =>
      create<EstudioRayosXResponse, EstudioRayosXCreateRequest>(
        ENDPOINTS.ESTUDIOS_RAYOS_X.CREATE,
        data,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(data.admissionId) })
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

  return useMutation({
    mutationFn: ({ id }: { id: number; admissionId: number | string }) =>
      remove<{ ok: boolean }>(ENDPOINTS.ESTUDIOS_RAYOS_X.DELETE(id)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: byAdmissionKey(variables.admissionId) })
    },
  })
}
