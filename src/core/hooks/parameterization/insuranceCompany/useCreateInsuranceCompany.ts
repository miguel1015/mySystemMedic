import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENDPOINTS } from "../../../api/endpoints/endpoints";
import { Insurance } from "../../../interfaces/parameterization/types";
import { create } from "../../../api/baseService";

export const insurerCompanyService = {
  create: (data: Partial<Insurance>) =>
    create<Insurance, Partial<Insurance>>(ENDPOINTS.INSURERS.CREATE, data),
};

export function useCreateInsuranceCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insurerCompanyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },
  });
}
