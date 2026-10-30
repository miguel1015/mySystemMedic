import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AdmissionCompanionRequest,
  AdmissionCompanionResponse,
  KinshipType,
} from "@/core/interfaces/care/admissionCompanion"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getOrNull, putJson } from "./admissionSubresource"

const companionKey = (admissionId?: number | string) => [
  "admission-companion",
  String(admissionId),
]

// Acompañante de la admisión; null si todavía no se ha registrado.
export function useGetAdmissionCompanion(admissionId?: number | string | null) {
  return useQuery({
    queryKey: companionKey(admissionId ?? undefined),
    queryFn: () =>
      getOrNull<AdmissionCompanionResponse>(ENDPOINTS.ADMISSION_COMPANION.GET(admissionId!)),
    enabled: !!admissionId,
  })
}

// Registra o reemplaza el acompañante; la tabla de admisiones se refresca para
// mostrarlo en su columna.
export function useSaveAdmissionCompanion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: number; data: AdmissionCompanionRequest }) =>
      putJson<AdmissionCompanionResponse>(ENDPOINTS.ADMISSION_COMPANION.SAVE(admissionId), data),
    onSuccess: (data) => {
      queryClient.setQueryData(companionKey(data.admissionId), data)
      queryClient.invalidateQueries({ queryKey: ["admissions", "search"] })
    },
  })
}

export function useKinshipTypes() {
  return useQuery({
    queryKey: ["kinship-types"],
    queryFn: () => getAll<KinshipType[]>(ENDPOINTS.ADMISSION_CATALOGS.KINSHIP_TYPES),
  })
}
