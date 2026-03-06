import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TCoverage {
  id: number;
  name: string;
}

export function useCoverages() {
  return useQuery({
    queryKey: ["coverages"],
    queryFn: () => getAll<TCoverage[]>(ENDPOINTS.COVERAGES.GET_ALL),
  })
}
