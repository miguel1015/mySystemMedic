import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { DataUser } from "@/core/interfaces/user/users";

export const userCreateUserService = {
  create: (data: Partial<DataUser>) =>
    create<DataUser, Partial<DataUser>>(ENDPOINTS.USERS.CREATE, data),
};

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userCreateUserService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
