import { useMutation, useQueryClient } from "@tanstack/react-query";
import { remove } from "../../../api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints";

export const insuranceCompanyDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.INSURERS.UPDATE(id)),
};

export function useDeleteInsuranceCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      insuranceCompanyDeleteService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },
  });
}
