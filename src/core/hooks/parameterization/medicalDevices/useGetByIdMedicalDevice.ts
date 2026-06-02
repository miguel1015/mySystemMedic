import { useQuery } from "@tanstack/react-query"
import { getById } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicalDevice } from "../../../interfaces/parameterization/types"

export const medicalDeviceByIdService = {
  getById: (id: string | number) =>
    getById<TMedicalDevice>(ENDPOINTS.MEDICAL_DEVICES.GET_BY_ID(id)),
}

export function useGetMedicalDeviceById(id: string | number) {
  return useQuery({
    queryKey: ["medical-devices", id],
    queryFn: () => medicalDeviceByIdService.getById(id),
    enabled: !!id,
  })
}
