import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const triageDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.TRIAGE.DELETE(id)),
}

export function useDeleteTriage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => triageDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triages"] })
    },
  })
}
