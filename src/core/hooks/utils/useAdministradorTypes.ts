import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { TAdministradorTypes } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userAdministradorTypesServices = {
  getAll: () =>
    getAll<TAdministradorTypes[]>(ENDPOINTS.ADMINISTRADOR_TYPES.GET_ALL),
};

export function useAdministradorTypes() {
  return useQuery({
    queryKey: ["administrador-types"],
    queryFn: userAdministradorTypesServices.getAll,
  });
}
