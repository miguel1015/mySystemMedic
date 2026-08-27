import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  SurgicalChargeCreateRequest,
  SurgicalChargeResponse,
} from "@/core/interfaces/care/surgicalCharge"

export const surgicalChargeCreateService = {
  create: (data: SurgicalChargeCreateRequest) =>
    create<SurgicalChargeResponse, SurgicalChargeCreateRequest>(
      ENDPOINTS.SURGICAL_CHARGES.CREATE,
      data,
    ),
}

export function useCreateSurgicalCharge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surgicalChargeCreateService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["surgical-charges", "by-admission", variables.admissionId],
      })
    },
  })
}
