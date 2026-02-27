import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { UserStatuses } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userStatuses = {
  getAll: () => getAll<UserStatuses[]>(ENDPOINTS.STATUSES.GET_ALL),
};

export function useUserStatuses() {
  return useQuery({
    queryKey: ["UserStatuses"],
    queryFn: userStatuses.getAll,
  });
}
