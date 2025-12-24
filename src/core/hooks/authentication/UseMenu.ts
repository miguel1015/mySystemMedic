import { getById } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { MenuResponse } from "@/types/typeModules";
import { useQuery } from "@tanstack/react-query";

export const NavigationService = {
  getById: (id: string | number) =>
    getById<MenuResponse>(ENDPOINTS.NAVIGATION.ME(id)),
};

export function useMenu(id: string | number) {
  return useQuery({
    queryKey: ["navigation", id],
    queryFn: () => NavigationService.getById(id),
    enabled: !!id,
  });
}
