import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { TCountries } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userCountriesServices = {
  getAll: () => getAll<TCountries[]>(ENDPOINTS.COUNTRIES.GET_ALL),
};

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: userCountriesServices.getAll,
  });
}
