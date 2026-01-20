import { useMutation, useQueryClient } from "@tanstack/react-query";
import { remove } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";

export const tariffsDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.TARIFFS.UPDATE(id)),
};

export function useDeleteTariffs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => tariffsDeleteService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
  });
}
