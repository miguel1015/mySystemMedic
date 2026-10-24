import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ADMISSION_NOTIFICATIONS_QUERY_KEY } from "@/core/hooks/notifications/useAdmissionNotifications"
import {
  TriageCreateRequest,
  TriageResponse,
} from "@/core/interfaces/care/types"

export const triageCreateService = {
  create: (data: TriageCreateRequest) =>
    create<TriageResponse, TriageCreateRequest>(
      ENDPOINTS.TRIAGE.CREATE,
      data,
    ),
}

export function useCreateTriage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triageCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triages"] })
      queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
    },
  })
}
