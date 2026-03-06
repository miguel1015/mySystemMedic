import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TEpsRegimen {
  id: number;
  name: string;
}

export function useEpsRegimens() {
  return useQuery({
    queryKey: ["eps-regimens"],
    queryFn: () => getAll<TEpsRegimen[]>(ENDPOINTS.EPS_REGIMENS.GET_ALL),
  })
}
