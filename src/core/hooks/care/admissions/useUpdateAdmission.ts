import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  AdmissionResponse,
  AdmissionUpdateRequest,
} from "@/core/interfaces/care/types"

export const admissionUpdateService = {
  update: (id: string | number, data: AdmissionUpdateRequest) =>
    updatePut<AdmissionResponse, AdmissionUpdateRequest>(
      ENDPOINTS.ADMISSIONS.UPDATE(id),
      data,
    ),
}

export function useUpdateAdmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: AdmissionUpdateRequest
    }) => admissionUpdateService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["admissions", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["active-admissions"] })
    },
  })
}
