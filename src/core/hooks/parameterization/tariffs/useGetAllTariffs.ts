import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TTariffs } from "../../../interfaces/parameterization/types";

export const userTariffsServices = {
  getAll: () => getAll<TTariffs[]>(ENDPOINTS.TARIFFS.GET_ALL),
};

export function useTariffs() {
  return useQuery({
    queryKey: ["tariffs"],
    queryFn: userTariffsServices.getAll,
  });
}
