import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  BillingMovementResponse,
  BillingMovementUpdateRequest,
} from "@/core/interfaces/care/billing"

export const billingMovementUpdateService = {
  update: (id: string | number, data: BillingMovementUpdateRequest) =>
    updatePut<BillingMovementResponse, BillingMovementUpdateRequest>(
      ENDPOINTS.BILLING_MOVEMENTS.UPDATE(id),
      data,
    ),
}

interface UpdateBillingMovementArgs {
  id: string | number
  admissionId: string | number
  data: BillingMovementUpdateRequest
}

export function useUpdateBillingMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateBillingMovementArgs) =>
      billingMovementUpdateService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["billing-movements", "by-admission", variables.admissionId],
      })
    },
  })
}
