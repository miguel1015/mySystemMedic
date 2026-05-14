import { useQuery } from "@tanstack/react-query";
import { ENDPOINTS } from "@/core/api/endpoints";
import { getAll } from "../../../api/baseService";
import { TTariffDetail } from "../../../interfaces/parameterization/types";

export const tariffDetailsServices = {
  getAll: () => getAll<TTariffDetail[]>(ENDPOINTS.TARIFF_DETAILS.GET_ALL),
};

export function useTariffDetails() {
  return useQuery({
    queryKey: ["tariffdetails"],
    queryFn: tariffDetailsServices.getAll,
    staleTime: 5 * 60 * 1000,
  });
}
