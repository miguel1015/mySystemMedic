import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updatePut } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { GetPatient, PatientData } from "@/core/interfaces/care/types"

export const patientUpdateService = {
  update: (id: string | number, data: PatientData) =>
    updatePut<GetPatient, PatientData>(ENDPOINTS.PATIENTS.UPDATE(id), data),
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: PatientData
    }) => patientUpdateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
