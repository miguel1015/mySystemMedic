import { getById } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { DataUser } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userGetUserByIdService = {
  getById: (id: string | number) =>
    getById<DataUser>(ENDPOINTS.USERS.GET_BY_ID(id)),
};

export function useGetUserById(id: string | number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userGetUserByIdService.getById(id),
    enabled: !!id,
  });
}
