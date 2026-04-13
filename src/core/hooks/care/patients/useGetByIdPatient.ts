import { useQuery } from "@tanstack/react-query"
import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { GetPatient } from "@/core/interfaces/care/types"

export const patientByIdService = {
  getById: (id: string | number) =>
    getById<GetPatient>(ENDPOINTS.PATIENTS.GET_BY_ID(id)),
}

export function useGetPatientById(id: string | number | null) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => patientByIdService.getById(id!),
    enabled: !!id,
  })
}
