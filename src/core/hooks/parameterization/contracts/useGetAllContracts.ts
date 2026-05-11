import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TContract } from "../../../interfaces/parameterization/types";

export const contractsServices = {
  getAll: () => getAll<TContract[]>(ENDPOINTS.CONTRACTS.GET_ALL),
  getByInsurer: (insurerId: string | number) =>
    getAll<TContract[]>(ENDPOINTS.CONTRACTS.BY_INSURER(insurerId)),
};

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: contractsServices.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useContractsByInsurer(insurerId?: number) {
  return useQuery({
    queryKey: ["contracts", "by-insurer", insurerId],
    queryFn: () => contractsServices.getByInsurer(insurerId as number),
    enabled: !!insurerId,
    staleTime: 5 * 60 * 1000,
  });
}
