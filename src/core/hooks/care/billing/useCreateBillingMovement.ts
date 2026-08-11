import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  BillingMovementCreateRequest,
  BillingMovementResponse,
} from "@/core/interfaces/care/billing"

export const billingMovementCreateService = {
  create: (data: BillingMovementCreateRequest) =>
    create<BillingMovementResponse, BillingMovementCreateRequest>(
      ENDPOINTS.BILLING_MOVEMENTS.CREATE,
      data,
    ),
}

export function useCreateBillingMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: billingMovementCreateService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["billing-movements", "by-admission", variables.admissionId],
      })
    },
  })
}
