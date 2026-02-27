import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicine } from "../../../interfaces/parameterization/types"

export const medicineUpdateService = {
  update: (id: string | number, data: Partial<TMedicine>) =>
    updatePut<TMedicine, Partial<TMedicine>>(ENDPOINTS.MEDICINES.UPDATE(id), data),
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: Partial<TMedicine>
    }) => medicineUpdateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
    },
  })
}
