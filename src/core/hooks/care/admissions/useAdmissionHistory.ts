import { useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import {
  AdmissionHistoryItem,
  AdmissionHistoryPatient,
  AdmissionRecordSummary,
} from "@/core/interfaces/care/types"

// Pacientes con al menos una admisión no eliminada.
export function useGetAdmissionHistoryPatients(search: string) {
  return useQuery({
    queryKey: ["admissions", "history", "patients", search],
    queryFn: () =>
      getAll<AdmissionHistoryPatient[]>(
        ENDPOINTS.ADMISSIONS.HISTORY_PATIENTS(new URLSearchParams({ search }).toString()),
      ),
  })
}

// Admisiones de un paciente con el estado de su proceso.
export function useGetAdmissionHistoryByPatient(patientId?: number | null) {
  return useQuery({
    queryKey: ["admissions", "history", "by-patient", patientId],
    queryFn: () =>
      getAll<AdmissionHistoryItem[]>(ENDPOINTS.ADMISSIONS.HISTORY_BY_PATIENT(patientId!)),
    enabled: !!patientId,
  })
}

// Cuántos registros tiene cada módulo de la admisión, en una sola consulta.
export function useGetAdmissionRecordSummary(admissionId?: number | null) {
  return useQuery({
    queryKey: ["admissions", "summary", admissionId],
    queryFn: () =>
      getAll<AdmissionRecordSummary>(ENDPOINTS.ADMISSIONS.SUMMARY(admissionId!)),
    enabled: !!admissionId,
  })
}
