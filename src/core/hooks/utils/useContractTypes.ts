import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TContractType {
  id: number;
  name: string;
}

export function useContractTypes() {
  return useQuery({
    queryKey: ["contract-types"],
    queryFn: () => getAll<TContractType[]>(ENDPOINTS.CONTRACT_TYPES.GET_ALL),
  })
}
