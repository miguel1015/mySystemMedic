import { useQuery } from "@tanstack/react-query";
import { getById } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TContractDetail } from "../../../interfaces/parameterization/types";

export const contractDetailByIdService = {
  getById: (id: string | number) =>
    getById<TContractDetail>(ENDPOINTS.CONTRACT_DETAILS.GET_BY_ID(id)),
};

export function useGetContractDetailById(id: string | number) {
  return useQuery({
    queryKey: ["contract-details", id],
    queryFn: () => contractDetailByIdService.getById(id),
    enabled: !!id,
  });
}
