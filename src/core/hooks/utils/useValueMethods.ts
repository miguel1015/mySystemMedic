import { useQuery } from "@tanstack/react-query"
import { getAll } from "../../api/baseService"
import { ENDPOINTS } from "../../api/endpoints"
import {
  CatalogItem,
  ContractCatalogs,
} from "../../interfaces/parameterization/types"

export const contractCatalogsService = {
  getAll: () => getAll<ContractCatalogs>(ENDPOINTS.CONTRACT_CATALOGS.GET_ALL),
}

export function useValueMethods() {
  return useQuery({
    queryKey: ["contract-catalogs"],
    queryFn: contractCatalogsService.getAll,
    staleTime: 5 * 60 * 1000,
    select: (data): CatalogItem[] => data?.valueMethods ?? [],
  })
}
