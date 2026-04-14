import { useMutation, useQueryClient } from "@tanstack/react-query"
import { create } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { GetPatient, PatientData } from "@/core/interfaces/care/types"

export const patientCreateService = {
  create: (data: PatientData) =>
    create<GetPatient, PatientData>(ENDPOINTS.PATIENTS.CREATE, data),
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: patientCreateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
