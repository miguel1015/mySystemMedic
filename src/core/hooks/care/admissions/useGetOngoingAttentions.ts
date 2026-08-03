import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import { AdmissionResponse, OngoingAttention } from "@/core/interfaces/care/types"
import { useQuery } from "@tanstack/react-query"

// GET /api/admissions ya filtra por IsActive == true en el backend
// (AdmissionsController.GetAll), así que no hace falta un endpoint dedicado.
function dedupeByPatient(items: AdmissionResponse[]): AdmissionResponse[] {
  const latestByPatient = new Map<number, AdmissionResponse>()

  for (const item of items) {
    const current = latestByPatient.get(item.patientId)
    if (!current) {
      latestByPatient.set(item.patientId, item)
      continue
    }

    const currentDate = new Date(current.admissionDate).getTime()
    const itemDate = new Date(item.admissionDate).getTime()
    if (itemDate > currentDate) {
      latestByPatient.set(item.patientId, item)
    }
  }

  return Array.from(latestByPatient.values())
}

function normalize(item: AdmissionResponse): OngoingAttention {
  return {
    admissionId: item.id,
    patientId: item.patientId,
    admissionDate: item.admissionDate,
    patientFullName: item.nombrePaciente,
    documentTypeName: item.documentTypeName,
    documentNumber: item.documentoPatiente,
    careScope: item.careScopeName,
  }
}

export function useOngoingAttentions() {
  return useQuery({
    queryKey: ["ongoing-attentions"],
    queryFn: async () => {
      const admissions = await getAll<AdmissionResponse[]>(ENDPOINTS.ADMISSIONS.GET_ALL)
      const activeOnly = admissions.filter((item) => item.isActive)
      return dedupeByPatient(activeOnly).map(normalize)
    },
  })
}
