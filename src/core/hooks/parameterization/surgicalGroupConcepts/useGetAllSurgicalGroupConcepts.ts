import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TSurgicalGroupConcept } from "@/core/interfaces/parameterization/types";

export const surgicalGroupConceptsServices = {
  getAll: (surgicalGroupId?: number | null) =>
    getAll<TSurgicalGroupConcept[]>(
      ENDPOINTS.SURGICAL_GROUP_CONCEPTS.GET_ALL,
      surgicalGroupId ? { params: { surgicalGroupId } } : undefined,
    ),
};

export function useSurgicalGroupConcepts(surgicalGroupId?: number | null) {
  return useQuery({
    queryKey: ["surgical-group-concepts", surgicalGroupId ?? "all"],
    queryFn: () => surgicalGroupConceptsServices.getAll(surgicalGroupId),
    staleTime: 5 * 60 * 1000,
  });
}
