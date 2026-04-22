import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  TriageResponse,
  TriageUpdateRequest,
} from "@/core/interfaces/care/types"

export const triageUpdateService = {
  update: (id: string | number, data: TriageUpdateRequest) =>
    updatePut<TriageResponse, TriageUpdateRequest>(
      ENDPOINTS.TRIAGE.UPDATE(id),
      data,
    ),
}

export function useUpdateTriage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: TriageUpdateRequest
    }) => triageUpdateService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["triages"] })
      queryClient.invalidateQueries({ queryKey: ["triages", variables.id] })
    },
  })
}
