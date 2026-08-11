import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { BillingMovementResponse } from "@/core/interfaces/care/billing"

export const billingMovementsService = {
  getByAdmission: (admissionId: string | number) =>
    getAll<BillingMovementResponse[]>(
      ENDPOINTS.BILLING_MOVEMENTS.GET_BY_ADMISSION(admissionId),
    ),
}

export function useGetBillingMovementsByAdmission(
  admissionId?: string | number | null,
) {
  return useQuery({
    queryKey: ["billing-movements", "by-admission", admissionId],
    queryFn: () => billingMovementsService.getByAdmission(admissionId!),
    enabled: !!admissionId,
  })
}
