import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { GetPatient } from "@/core/interfaces/care/types"

export const patientsServices = {
  getAll: () => getAll<GetPatient[]>(ENDPOINTS.PATIENTS.GET_ALL),
}

export function useGetAllPatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: patientsServices.getAll,
  })
}
