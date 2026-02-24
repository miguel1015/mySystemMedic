import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { TContract } from "../../../interfaces/parameterization/types";

export const contractsServices = {
  getAll: () => getAll<TContract[]>(ENDPOINTS.CONTRACTS.GET_ALL),
};

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: contractsServices.getAll,
  });
}
