import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicalDevice } from "../../../interfaces/parameterization/types"

export const medicalDeviceCreateService = {
  create: (data: Partial<TMedicalDevice>) =>
    create<TMedicalDevice, Partial<TMedicalDevice>>(
      ENDPOINTS.MEDICAL_DEVICES.CREATE,
      data,
    ),
}

export function useCreateMedicalDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: medicalDeviceCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-devices"] })
    },
  })
}
