import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ADMISSION_NOTIFICATIONS_QUERY_KEY } from "@/core/hooks/notifications/useAdmissionNotifications"

export const triageDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.TRIAGE.DELETE(id)),
}

export function useDeleteTriage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => triageDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triages"] })
      queryClient.invalidateQueries({ queryKey: ADMISSION_NOTIFICATIONS_QUERY_KEY })
    },
  })
}
