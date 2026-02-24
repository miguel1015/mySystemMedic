import { useQuery } from "@tanstack/react-query";
import { getById } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { TContract } from "../../../interfaces/parameterization/types";

export const contractByIdService = {
  getById: (id: string | number) =>
    getById<TContract>(ENDPOINTS.CONTRACTS.GET_BY_ID(id)),
};

export function useGetContractById(id: string | number) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => contractByIdService.getById(id),
    enabled: !!id,
  });
}
