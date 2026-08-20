import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TSurgicalGroup } from "@/core/interfaces/parameterization/types";

export const surgicalGroupsServices = {
  getAll: () =>
    getAll<TSurgicalGroup[]>(ENDPOINTS.SURGICAL_GROUPS.GET_ALL),
};

export function useSurgicalGroups() {
  return useQuery({
    queryKey: ["surgical-groups"],
    queryFn: surgicalGroupsServices.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
