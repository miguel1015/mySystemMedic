import { useQuery } from "@tanstack/react-query"
import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { AdmissionResponse } from "@/core/interfaces/care/types"

export const admissionByIdService = {
  getById: (id: string | number) =>
    getById<AdmissionResponse>(ENDPOINTS.ADMISSIONS.GET_BY_ID(id)),
}

export function useGetAdmissionById(id?: string | number | null) {
  return useQuery({
    queryKey: ["admissions", id],
    queryFn: () => admissionByIdService.getById(id!),
    enabled: !!id,
  })
}
