import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  TriageCreateRequest,
  TriageResponse,
} from "@/core/interfaces/care/types"

export const triageCreateService = {
  create: (data: TriageCreateRequest) =>
    create<TriageResponse, TriageCreateRequest>(
      ENDPOINTS.TRIAGE.CREATE,
      data,
    ),
}

export function useCreateTriage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triageCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triages"] })
    },
  })
}
