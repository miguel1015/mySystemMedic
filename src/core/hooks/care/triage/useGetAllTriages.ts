import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { TriageResponse } from "@/core/interfaces/care/types"

export const triagesServices = {
  getAll: () => getAll<TriageResponse[]>(ENDPOINTS.TRIAGE.GET_ALL),
}

export function useGetAllTriages() {
  return useQuery({
    queryKey: ["triages"],
    queryFn: triagesServices.getAll,
  })
}
