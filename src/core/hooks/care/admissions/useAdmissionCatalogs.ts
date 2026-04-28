import { useQuery } from "@tanstack/react-query";
import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { AdmissionCatalogs } from "@/core/interfaces/care/types";

export const admissionCatalogsService = {
  getAll: () => getAll<AdmissionCatalogs>(ENDPOINTS.ADMISSION_CATALOGS.GET_ALL),
};

export function useAdmissionCatalogs() {
  return useQuery({
    queryKey: ["admission-catalogs"],
    queryFn: admissionCatalogsService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
