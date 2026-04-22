import { useQuery } from "@tanstack/react-query"
import { getById } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TriageResponse } from "@/core/interfaces/care/types"

export const triageByIdService = {
  getById: (id: string | number) =>
    getById<TriageResponse>(ENDPOINTS.TRIAGE.GET_BY_ID(id)),
}

export function useGetTriageById(id: string | number | null) {
  return useQuery({
    queryKey: ["triages", id],
    queryFn: () => triageByIdService.getById(id!),
    enabled: !!id,
  })
}
