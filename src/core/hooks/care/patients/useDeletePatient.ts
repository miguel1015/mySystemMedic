import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const patientDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.PATIENTS.DELETE(id)),
}

export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => patientDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
