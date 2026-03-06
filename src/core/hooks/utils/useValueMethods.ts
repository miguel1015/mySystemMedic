import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TValueMethod {
  id: number;
  name: string;
}

export function useValueMethods() {
  return useQuery({
    queryKey: ["value-methods"],
    queryFn: () => getAll<TValueMethod[]>(ENDPOINTS.VALUE_METHODS.GET_ALL),
  })
}
