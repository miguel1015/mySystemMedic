import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const userRolesService = {
  getAll: () => getAll(ENDPOINTS.USERS_ROLES.GET_ALL),
};

export function useUserRoles() {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: userRolesService.getAll,
  });
}
