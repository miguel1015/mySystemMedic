import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  AdmissionCreateRequest,
  AdmissionResponse,
} from "@/core/interfaces/care/types"

export const admissionCreateService = {
  create: (data: AdmissionCreateRequest) =>
    create<AdmissionResponse, AdmissionCreateRequest>(
      ENDPOINTS.ADMISSIONS.CREATE,
      data,
    ),
}

export function useCreateAdmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: admissionCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] })
      queryClient.invalidateQueries({ queryKey: ["active-admissions"] })
    },
  })
}
