import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { Contract, TContract } from "../../../interfaces/parameterization/types";

export const contractCreateService = {
  create: (data: Partial<Contract>) =>
    create<TContract, Partial<Contract>>(ENDPOINTS.CONTRACTS.CREATE, data),
};

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
