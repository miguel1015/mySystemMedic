import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TTariffs } from "../../../interfaces/parameterization/types";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { updatePut } from "../../../api/baseService";

export const tariffsUpdateService = {
  update: (id: string | number, data: Partial<TTariffs>) =>
    updatePut<TTariffs, Partial<TTariffs>>(ENDPOINTS.TARIFFS.UPDATE(id), data),
};

export function useUpdateTariffs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<TTariffs>;
    }) => tariffsUpdateService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
  });
}
