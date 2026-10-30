import { ENDPOINTS } from "@/core/api/endpoints"
import type {
  AdmissionReferralRequest,
  AdmissionReferralResponse,
} from "@/core/interfaces/care/admissionReferral"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getOrNull, putJson } from "./admissionSubresource"

const referralKey = (admissionId?: number | string) => [
  "admission-referral",
  String(admissionId),
]

// Remisión de la admisión; null si el paciente no tiene remisión registrada.
export function useGetAdmissionReferral(admissionId?: number | string | null) {
  return useQuery({
    queryKey: referralKey(admissionId ?? undefined),
    queryFn: () =>
      getOrNull<AdmissionReferralResponse>(ENDPOINTS.ADMISSION_REFERRAL.GET(admissionId!)),
    enabled: !!admissionId,
  })
}

// Registra o reemplaza la remisión; la tabla de admisiones se refresca para que el
// menú muestre "Editar remisión".
export function useSaveAdmissionReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ admissionId, data }: { admissionId: number; data: AdmissionReferralRequest }) =>
      putJson<AdmissionReferralResponse>(ENDPOINTS.ADMISSION_REFERRAL.SAVE(admissionId), data),
    onSuccess: (data) => {
      queryClient.setQueryData(referralKey(data.admissionId), data)
      queryClient.invalidateQueries({ queryKey: ["admissions", "search"] })
    },
  })
}
