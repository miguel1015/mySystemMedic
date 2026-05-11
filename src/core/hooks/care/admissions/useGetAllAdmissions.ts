import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { AdmissionResponse } from "@/core/interfaces/care/types"

export const admissionsServices = {
  getAll: () => getAll<AdmissionResponse[]>(ENDPOINTS.ADMISSIONS.GET_ALL),
}

export function useGetAllAdmissions() {
  return useQuery({
    queryKey: ["admissions"],
    queryFn: admissionsServices.getAll,
  })
}
