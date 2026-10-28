import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  BillingMovementBatchUpdateRequest,
  BillingMovementResponse,
} from "@/core/interfaces/care/billing"

interface UpdateBillingMovementsBatchArgs {
  admissionId: string | number
  data: BillingMovementBatchUpdateRequest
}

// Guarda varias correcciones en una sola transacción: o se aplican todas o ninguna.
export function useUpdateBillingMovementsBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data }: UpdateBillingMovementsBatchArgs) =>
      updatePut<BillingMovementResponse[], BillingMovementBatchUpdateRequest>(
        ENDPOINTS.BILLING_MOVEMENTS.UPDATE_BATCH,
        data,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["billing-movements", "by-admission", variables.admissionId],
      })
    },
  })
}
