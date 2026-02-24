import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import {
  ContractDetail,
  TContractDetail,
} from "../../../interfaces/parameterization/types";

export const contractDetailCreateService = {
  create: (data: Partial<ContractDetail>) =>
    create<TContractDetail, Partial<ContractDetail>>(
      ENDPOINTS.CONTRACT_DETAILS.CREATE,
      data,
    ),
};

export function useCreateContractDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractDetailCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-details"] });
    },
  });
}
