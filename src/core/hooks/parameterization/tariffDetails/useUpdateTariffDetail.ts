import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePut } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";
import { NewCups } from "@/core/interfaces/parameterization/cups";
import { TTariffDetail } from "@/core/interfaces/parameterization/types";

export type TTariffDetailUpdate = Partial<TTariffDetail> & { newCups?: NewCups };

export const tariffDetailUpdateService = {
  update: (id: string | number, data: TTariffDetailUpdate) =>
    updatePut<TTariffDetail, TTariffDetailUpdate>(
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
      data: TTariffDetailUpdate;
    }) => tariffDetailUpdateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffdetails-paged"] });
      // El CUPS editado aquí también se ve en la pantalla de homologación.
      queryClient.invalidateQueries({ queryKey: ["cups-homologation"] });
      // Un CUPS agregado aquí debe aparecer en las búsquedas, que se guardan sin vencer.
      queryClient.invalidateQueries({ queryKey: ["cups"] });
    },
  });
}
