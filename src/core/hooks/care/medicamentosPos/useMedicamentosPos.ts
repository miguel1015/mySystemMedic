import { create, getAll, remove, updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { MedicamentoPos, MedicamentoPosRequest } from "@/core/interfaces/care/medicamentoPos"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const BY_ADMISSION_KEY = ["medicamentos-pos", "by-admission"]

export function useGetMedicamentosPosByAdmission(admissionId?: number | string) {
  return useQuery({
    queryKey: [...BY_ADMISSION_KEY, String(admissionId)],
    queryFn: () =>
      getAll<MedicamentoPos[]>(ENDPOINTS.MEDICAMENTOS_POS.GET_BY_ADMISSION(admissionId!)),
    enabled: !!admissionId,
  })
}

export function useCrearMedicamentoPos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MedicamentoPosRequest) =>
      create<MedicamentoPos, MedicamentoPosRequest>(ENDPOINTS.MEDICAMENTOS_POS.CREATE, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}

export function useActualizarMedicamentoPos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MedicamentoPosRequest }) =>
      updatePut<MedicamentoPos, MedicamentoPosRequest>(ENDPOINTS.MEDICAMENTOS_POS.UPDATE(id), data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}

export function useAnularMedicamentoPos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      remove<{ ok: boolean }>(ENDPOINTS.MEDICAMENTOS_POS.DELETE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BY_ADMISSION_KEY }),
  })
}
