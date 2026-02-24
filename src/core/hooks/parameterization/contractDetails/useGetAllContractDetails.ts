import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { TContractDetail } from "../../../interfaces/parameterization/types";

export const contractDetailsServices = {
  getAll: () =>
    getAll<TContractDetail[]>(ENDPOINTS.CONTRACT_DETAILS.GET_ALL),
};

export function useContractDetails() {
  return useQuery({
    queryKey: ["contract-details"],
    queryFn: contractDetailsServices.getAll,
  });
}
