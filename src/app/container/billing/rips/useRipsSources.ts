"use client"

import { INSTITUTION_PROVIDER_ID } from "@/app/container/care/clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetDatosClinicosEgresoByAdmission } from "@/core/hooks/care/dischargeNote/useGetDatosClinicosEgresoByAdmission"
import { useGetDiagnosticosEgresoByIds } from "@/core/hooks/care/dischargeNote/useGetDiagnosticosEgresoByIds"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUserById } from "@/core/hooks/users/useGetByIdUser"
import { useGetProfessionals } from "@/core/hooks/users/useGetProfessionals"
import { useMemo } from "react"
import type { RipsProfessional } from "./buildRips"

// Datos de la admisión con los que se arma el RIPS (todo menos la factura). Lo usan la vista
// RIPS de la factura y la pestaña de validación de Admisión integral, para que ambas calculen
// lo mismo.
export function useRipsSources(admissionId: number | null) {
  const { data: admission, isLoading: isLoadingAdmission } = useGetAdmissionById(admissionId)
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(
    admission?.patientId ?? null,
  )
  const { data: provider, isLoading: isLoadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const { data: movements = [], isLoading: isLoadingMovements } =
    useGetBillingMovementsByAdmission(admissionId)
  const { data: hcInicial, isLoading: isLoadingHc } = useGetHCInicialByAdmission(
    admissionId ?? undefined,
  )
  const { data: dischargeRecords = [], isLoading: isLoadingDischarge } =
    useGetDatosClinicosEgresoByAdmission(admissionId ?? undefined)

  const activeDischarge = useMemo(
    () => dischargeRecords.find((record) => record.isActive) ?? dischargeRecords[0] ?? null,
    [dischargeRecords],
  )
  const { data: diagnosticosEgresoData, isLoading: isLoadingDiagnosticosEgreso } =
    useGetDiagnosticosEgresoByIds([activeDischarge?.diagnosticoEgresoId])
  const diagnosticoEgreso = diagnosticosEgresoData[0] ?? null

  const diagnosticosIngreso = useMemo(
    () => hcInicial?.analisisDiagnosticosPlan?.diagnosticos ?? [],
    [hcInicial],
  )

  // Médico de la HC inicial: respaldo para los cargos sin profesional. La lista de
  // profesionales la ve cualquier rol; el detalle por id solo los administradores.
  const { data: professionals = [] } = useGetProfessionals()
  const { data: professionalUser } = useGetUserById(hcInicial?.userId ?? 0)
  const hcProfessional = useMemo<RipsProfessional | null>(() => {
    const listed = professionals.find((item) => item.id === hcInicial?.userId)
    if (listed) {
      return {
        documentTypeCode: listed.documentTypeCode,
        documentNumber: listed.documentNumber,
        name: hcInicial?.nombreProfesional ?? listed.fullName,
      }
    }
    if (professionalUser) {
      return {
        documentTypeCode: professionalUser.documentTypeCode ?? null,
        documentNumber: professionalUser.documentNumber ?? null,
        name: hcInicial?.nombreProfesional ?? null,
      }
    }
    return null
  }, [professionals, professionalUser, hcInicial])

  const isLoading =
    isLoadingAdmission ||
    isLoadingPatient ||
    isLoadingProvider ||
    isLoadingMovements ||
    isLoadingHc ||
    isLoadingDischarge ||
    isLoadingDiagnosticosEgreso

  return {
    admission,
    patient,
    provider,
    movements,
    diagnosticosIngreso,
    diagnosticoEgreso,
    hcProfessional,
    professionals,
    isLoading,
  }
}
