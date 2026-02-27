import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePut } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import {
  ContractDetail,
  TContractDetail,
} from "../../../interfaces/parameterization/types";

export const contractDetailUpdateService = {
  update: (id: string | number, data: Partial<ContractDetail>) =>
    updatePut<TContractDetail, Partial<ContractDetail>>(
      ENDPOINTS.CONTRACT_DETAILS.UPDATE(id),
      data,
    ),
};

export function useUpdateContractDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<ContractDetail>;
    }) => contractDetailUpdateService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-details"] });
    },
  });
}
