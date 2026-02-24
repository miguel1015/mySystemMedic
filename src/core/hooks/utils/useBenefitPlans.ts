import { getAll } from "@/core/api/baseService";
import { ENDPOINTS } from "@/core/api/endpoints/endpoints";
import { TBenefitPlans } from "@/core/interfaces/user/users";
import { useQuery } from "@tanstack/react-query";

export const benefitPlansServices = {
  getAll: () => getAll<TBenefitPlans[]>(ENDPOINTS.BENEFIT_PLANS.GET_ALL),
};

export function useBenefitPlans() {
  return useQuery({
    queryKey: ["benefit-plans"],
    queryFn: benefitPlansServices.getAll,
  });
}
