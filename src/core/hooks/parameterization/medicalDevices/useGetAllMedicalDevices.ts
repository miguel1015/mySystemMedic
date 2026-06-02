import { useQuery } from "@tanstack/react-query"
import { getAll } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TMedicalDevice } from "../../../interfaces/parameterization/types"

export const medicalDevicesServices = {
  getAll: () => getAll<TMedicalDevice[]>(ENDPOINTS.MEDICAL_DEVICES.GET_ALL),
}

export function useMedicalDevices() {
  return useQuery({
    queryKey: ["medical-devices"],
    queryFn: medicalDevicesServices.getAll,
    staleTime: 5 * 60 * 1000,
  })
}
