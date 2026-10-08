import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import type { ProfessionalOption } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export function useGetProfessionals() {
  return useQuery({
    queryKey: ["users", "professionals"],
    queryFn: () => getAll<ProfessionalOption[]>(ENDPOINTS.PROFESSIONALS.GET_ALL),
    staleTime: 5 * 60 * 1000,
  });
}
