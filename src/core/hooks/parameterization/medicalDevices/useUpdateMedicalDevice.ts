import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicalDevice } from "../../../interfaces/parameterization/types"

export const medicalDeviceUpdateService = {
  update: (id: string | number, data: Partial<TMedicalDevice>) =>
    updatePut<TMedicalDevice, Partial<TMedicalDevice>>(
      ENDPOINTS.MEDICAL_DEVICES.UPDATE(id),
      data,
    ),
}

export function useUpdateMedicalDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: Partial<TMedicalDevice>
    }) => medicalDeviceUpdateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-devices"] })
    },
  })
}
