import { useQuery } from "@tanstack/react-query"
import { getAll } from "../../../api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { ContractCatalogs } from "../../../interfaces/parameterization/types"

export const contractCatalogsService = {
  getAll: () =>
    getAll<ContractCatalogs>(ENDPOINTS.CONTRACT_CATALOGS.GET_ALL),
}

export function useContractCatalogs() {
  return useQuery({
    queryKey: ["contract-catalogs"],
    queryFn: contractCatalogsService.getAll,
  })
}
