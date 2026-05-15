import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  ActiveAdmission,
  AdmissionResponse,
} from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

const mapAdmissionToActiveAdmission = (
  admission: AdmissionResponse,
): ActiveAdmission => ({
  id: admission.id,
  admissionDate: admission.createdAt,
  patientFullName: admission.nombrePaciente,
  documentNumber: admission.documentoPatiente,
  careScope: admission.careScopeName,
  patientId: admission.patientId,
})

export function useActiveAdmissions() {
  return useQuery({
    queryKey: ["active-admissions"],
    queryFn: async () => {
      const admissions = await getAll<AdmissionResponse[]>(
        ENDPOINTS.ADMISSIONS.GET_ALL,
      )

      return admissions
        .filter((admission) => admission.isActive)
        .map(mapAdmissionToActiveAdmission)
    },
  })
}
