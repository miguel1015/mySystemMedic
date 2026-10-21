import { getById } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { DataUser } from "@/core/interfaces/user/users";
import { useQueries, useQuery } from "@tanstack/react-query";

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

// Varios usuarios a la vez (p. ej. los firmantes de un documento), indexados por id.
export function useGetUsersByIds(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => userGetUserByIdService.getById(id),
      enabled: !!id,
    })),
    combine: (results) => ({
      usersById: new Map(ids.map((id, i) => [id, results[i]?.data] as const)),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}
