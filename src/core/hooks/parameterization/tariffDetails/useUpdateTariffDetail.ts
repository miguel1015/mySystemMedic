import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePut } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";

export const tariffDetailUpdateService = {
  update: (id: string | number, data: Partial<TTariffDetail>) =>
    updatePut<TTariffDetail, Partial<TTariffDetail>>(
      ENDPOINTS.TARIFF_DETAILS.UPDATE(id),
      data,
    ),
};

export function useUpdateTariffDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<TTariffDetail>;
    }) => tariffDetailUpdateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffdetails-paged"] });
    },
  });
}
