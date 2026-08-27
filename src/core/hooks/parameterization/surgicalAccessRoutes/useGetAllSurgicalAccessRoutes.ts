import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TSurgicalAccessRoute } from "@/core/interfaces/parameterization/types";

export const surgicalAccessRoutesServices = {
  getAll: () =>
    getAll<TSurgicalAccessRoute[]>(ENDPOINTS.SURGICAL_ACCESS_ROUTES.GET_ALL),
};

export function useSurgicalAccessRoutes() {
  return useQuery({
    queryKey: ["surgical-access-routes"],
    queryFn: surgicalAccessRoutesServices.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
