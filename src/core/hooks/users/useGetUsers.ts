import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { GetUser } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const getUsersService = {
  getAll: () => getAll<GetUser[]>(ENDPOINTS.USERS.GET_ALL),
};

export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsersService.getAll,
  });
}
