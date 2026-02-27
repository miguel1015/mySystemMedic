import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TTariffs } from "../../../interfaces/parameterization/types";
import { getById } from "../../../api/baseService";

export const tariffsByIdService = {
  getById: (id: string | number) =>
    getById<TTariffs>(ENDPOINTS.TARIFFS.GET_BY_ID(id)),
};

export function useGetTariffById(id: string | number) {
  return useQuery({
    queryKey: ["tariffs", id],
    queryFn: () => tariffsByIdService.getById(id),
    enabled: !!id,
  });
}
