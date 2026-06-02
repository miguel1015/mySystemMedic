import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const medicalDeviceDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.MEDICAL_DEVICES.DELETE(id)),
}

export function useDeleteMedicalDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => medicalDeviceDeleteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-devices"] })
    },
  })
}
