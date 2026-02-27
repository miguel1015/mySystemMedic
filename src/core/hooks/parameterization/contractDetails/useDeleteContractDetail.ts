import { useMutation, useQueryClient } from "@tanstack/react-query";
import { remove } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";

export const contractDetailDeleteService = {
  delete: (id: string | number) =>
    remove(ENDPOINTS.CONTRACT_DETAILS.DELETE(id)),
};

export function useDeleteContractDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => contractDetailDeleteService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-details"] });
    },
  });
}
