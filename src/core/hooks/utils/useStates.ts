import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { TStates } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userStatesServices = {
  getAll: () => getAll<TStates[]>(ENDPOINTS.STATES.GET_ALL),
};

export function useStates() {
  return useQuery({
    queryKey: ["states"],
    queryFn: userStatesServices.getAll,
  });
}
