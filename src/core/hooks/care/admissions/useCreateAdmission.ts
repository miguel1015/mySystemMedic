import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ADMISSION_NOTIFICATIONS_QUERY_KEY } from "@/core/hooks/notifications/useAdmissionNotifications"
import {
  AdmissionCreateRequest,
  AdmissionResponse,
} from "@/core/interfaces/care/types"

export const admissionCreateService = {
  create: (data: AdmissionCreateRequest) =>
    create<AdmissionResponse, AdmissionCreateRequest>(
      ENDPOINTS.ADMISSIONS.CREATE,
      data,
    ),
}

export function useCreateAdmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: admissionCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["active-admissions"] })
      queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
    },
  })
}
