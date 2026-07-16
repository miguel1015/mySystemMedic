import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import type { UserByProfile } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const getUsersByProfileService = {
  getAll: (profile: string) =>
    getAll<UserByProfile[]>(ENDPOINTS.USERS_BY_PROFILE.GET_ALL, { params: { profile } }),
};

export function useGetUsersByProfile(profile: string) {
  return useQuery({
    queryKey: ["users", "by-profile", profile],
    queryFn: () => getUsersByProfileService.getAll(profile),
    enabled: !!profile,
  });
}
