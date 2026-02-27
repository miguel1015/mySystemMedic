import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicine } from "../../../interfaces/parameterization/types"

export const medicineCreateService = {
  create: (data: Partial<TMedicine>) =>
    create<TMedicine, Partial<TMedicine>>(ENDPOINTS.MEDICINES.CREATE, data),
}

export function useCreateMedicine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: medicineCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] })
    },
  })
}
