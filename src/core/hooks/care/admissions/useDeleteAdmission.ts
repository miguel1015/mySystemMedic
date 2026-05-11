import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const admissionDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.ADMISSIONS.DELETE(id)),
}

export function useDeleteAdmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => admissionDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["active-admissions"] })
    },
  })
}
