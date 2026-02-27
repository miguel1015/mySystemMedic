import { useMutation, useQueryClient } from "@tanstack/react-query";
import { remove } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";

export const contractDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.CONTRACTS.DELETE(id)),
};

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => contractDeleteService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
