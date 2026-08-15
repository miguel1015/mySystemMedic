import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/core/api/endpoints";
import { getAll } from "@/core/api/baseService";
import { TTariffDetailsPaged } from "@/core/interfaces/parameterization/types";

export function useTariffDetailsPaged(
  page: number,
  pageSize: number,
  search?: string,
) {
  return useQuery({
    queryKey: ["tariffdetails-paged", page, pageSize, search],
    queryFn: () =>
      getAll<TTariffDetailsPaged>(
        ENDPOINTS.TARIFF_DETAILS.GET_ALL_PAGED(page, pageSize, search),
      ),
    placeholderData: (prev) => prev,
  });
}
