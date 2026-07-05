"use client"

import { useQueries, useQuery } from "@tanstack/react-query"
import { getAll } from "@/core/api/baseService"
import { ENDPOINTS } from "@/core/api/endpoints"
import type { AdmissionResponse } from "@/core/interfaces/care/types"
import type { HCInicialResponse } from "@/core/interfaces/care/hciInicial"
import { fetchHCInicialByAdmission } from "./useGetHCInicialByAdmission"

export interface HCInicialHistoryRecord {
  admission: AdmissionResponse
  hcInicial: HCInicialResponse
}

export function useHCInicialHistoryByPatient(patientId?: string | number) {
  const { data: admissions = [], isLoading: isLoadingAdmissions } = useQuery({
    queryKey: ["admissions", "by-patient", patientId],
    queryFn: async () => {
      const all = await getAll<AdmissionResponse[]>(ENDPOINTS.ADMISSIONS.GET_ALL)
      return all.filter((admission) => String(admission.patientId) === String(patientId))
    },
    enabled: !!patientId,
  })

  const hcInicialQueries = useQueries({
    queries: admissions.map((admission) => ({
      queryKey: ["hci-inicial", "by-admission", admission.id],
      queryFn: () => fetchHCInicialByAdmission(admission.id),
      enabled: !!admission.id,
    })),
  })

  const isLoadingHciInicial = hcInicialQueries.some((query) => query.isLoading)

  const records: HCInicialHistoryRecord[] = admissions
    .map((admission, index) => ({
      admission,
      hcInicial: hcInicialQueries[index]?.data ?? null,
    }))
    .filter((record): record is HCInicialHistoryRecord => !!record.hcInicial)
    .sort(
      (a, b) => new Date(b.admission.createdAt).getTime() - new Date(a.admission.createdAt).getTime(),
    )

  return {
    records,
    isLoading: isLoadingAdmissions || isLoadingHciInicial,
  }
}
