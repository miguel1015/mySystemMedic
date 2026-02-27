import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePut } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { Contract, TContract } from "../../../interfaces/parameterization/types";

export const contractUpdateService = {
  update: (id: string | number, data: Partial<Contract>) =>
    updatePut<TContract, Partial<Contract>>(ENDPOINTS.CONTRACTS.UPDATE(id), data),
};

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<Contract>;
    }) => contractUpdateService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
