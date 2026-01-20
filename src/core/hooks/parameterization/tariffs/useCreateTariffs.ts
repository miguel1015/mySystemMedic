import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { TTariffs } from "../../../interfaces/parameterization/types";

export const tariffsService = {
  create: (data: Partial<TTariffs>) =>
    create<TTariffs, Partial<TTariffs>>(ENDPOINTS.TARIFFS.CREATE, data),
};

export function useCreateTariffs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tariffsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
    },
  });
}
