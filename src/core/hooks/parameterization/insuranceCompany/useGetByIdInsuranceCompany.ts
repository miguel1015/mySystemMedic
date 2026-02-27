import { useQuery } from "@tanstack/react-query";
import { getById } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { Insurance } from "../../../interfaces/parameterization/types";

export const insuranceCompaniesByIdService = {
  getById: (id: string | number) =>
    getById<Insurance>(ENDPOINTS.INSURERS.GET_BY_ID(id)),
};

export function useGetInsuranceCompanyById(id: string | number) {
  return useQuery({
    queryKey: ["insurers", id],
    queryFn: () => insuranceCompaniesByIdService.getById(id),
    enabled: !!id,
  });
}
