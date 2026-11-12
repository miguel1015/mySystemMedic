"use client"

import { ArrowRightOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import ActiveAdmissionsTable from "@/app/container/care/shared/ActiveAdmissionsTable"

// Entrada del cargue de cirugía: se elige un paciente con admisión activa.
const PatientPicker = () => {
  const router = useRouter()
  const { data: admissions = [], isLoading, isError, refetch } = useActiveAdmissions()

  const startProcess = (record: ActiveAdmission) => {
    const params = new URLSearchParams({
      admissionId: String(record.id),
      patientId: String(record.patientId),
      patientName: record.patientFullName,
      documentNumber: record.documentNumber,
      careScope: record.careScope,
      admissionDate: record.admissionDate,
    })
    router.push(`/billing/surgicalCharge?${params.toString()}`)
  }

  return (
    <ActiveAdmissionsTable
      data={admissions}
      loading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      onAction={startProcess}
      actionLabel="Cargar cirugía"
      actionIcon={<ArrowRightOutlined />}
    />
  )
}

export default PatientPicker
