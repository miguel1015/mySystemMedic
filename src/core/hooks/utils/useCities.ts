import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { TCities } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userCitiesServices = {
  getAll: () => getAll<TCities[]>(ENDPOINTS.CITIES.GET_ALL),
};

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: userCitiesServices.getAll,
  });
}
