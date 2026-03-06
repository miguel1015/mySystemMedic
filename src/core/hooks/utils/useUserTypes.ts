import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { useQuery } from "@tanstack/react-query"

interface TUserType {
  id: number;
  name: string;
}

export function useUserTypes() {
  return useQuery({
    queryKey: ["user-types"],
    queryFn: () => getAll<TUserType[]>(ENDPOINTS.USER_TYPES.GET_ALL),
  })
}
