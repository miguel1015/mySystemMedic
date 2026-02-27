import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const medicineDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.MEDICINES.DELETE(id)),
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => medicineDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
    },
  })
}
