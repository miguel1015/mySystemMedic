import { remove } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const userDeleteUserService = {
  delete: (id: string | number) => remove(ENDPOINTS.USERS.UPDATE(id)),
};

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => userDeleteUserService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
