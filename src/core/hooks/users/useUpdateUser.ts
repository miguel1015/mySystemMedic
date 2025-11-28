import { updatePut } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { DataUser } from "@/core/interfaces/user/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const userUpdateUserService = {
  update: (id: string | number, data: Partial<DataUser>) =>
    updatePut<DataUser, Partial<DataUser>>(ENDPOINTS.USERS.UPDATE(id), data),
};

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<DataUser>;
    }) => userUpdateUserService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
