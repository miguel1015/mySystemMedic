import { useMutation, useQueryClient } from "@tanstack/react-query"
import { remove } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"

export const billingMovementDeleteService = {
  delete: (id: string | number) => remove(ENDPOINTS.BILLING_MOVEMENTS.DELETE(id)),
}

interface DeleteBillingMovementArgs {
  id: string | number
  admissionId: string | number
}

export function useDeleteBillingMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: DeleteBillingMovementArgs) =>
      billingMovementDeleteService.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["billing-movements", "by-admission", variables.admissionId],
      })
    },
  })
}
