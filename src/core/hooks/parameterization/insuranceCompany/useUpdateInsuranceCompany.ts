import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePut } from "../../../api/baseService";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { Insurance } from "../../../interfaces/parameterization/types";

export const insuranceCompanyUpdateService = {
  update: (id: string | number, data: Partial<Insurance>) =>
    updatePut<Insurance, Partial<Insurance>>(
      ENDPOINTS.INSURERS.UPDATE(id),
      data
    ),
};

export function useUpdateInsuranceCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<Insurance>;
    }) => insuranceCompanyUpdateService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },
  });
}
