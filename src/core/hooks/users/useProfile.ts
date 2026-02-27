import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { UserProfile } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const userProfilesServices = {
  getAll: () => getAll<UserProfile[]>(ENDPOINTS.PROFILES.GET_ALL),
};

export function useUserProfiles() {
  return useQuery({
    queryKey: ["user-profiles"],
    queryFn: userProfilesServices.getAll,
  });
}
