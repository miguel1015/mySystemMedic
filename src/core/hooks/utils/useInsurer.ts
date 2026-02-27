import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TInsurers } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userInsurersServices = {
  getAll: () => getAll<TInsurers[]>(ENDPOINTS.INSURERS.GET_ALL),
};

export function useInsurers() {
  return useQuery({
    queryKey: ["insurers"],
    queryFn: userInsurersServices.getAll,
  });
}
