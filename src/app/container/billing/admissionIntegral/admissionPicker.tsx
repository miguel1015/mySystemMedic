"use client"

import { ArrowRightOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import ActiveAdmissionsTable from "@/app/container/care/shared/ActiveAdmissionsTable"

// Entrada de la admisión integral: se elige un paciente con admisión activa.
const AdmissionPicker = () => {
  const router = useRouter()
  const { data: admissions = [], isLoading, isError, refetch } = useActiveAdmissions()

  const openAdmission = (record: ActiveAdmission) => {
    const params = new URLSearchParams({
      admissionId: String(record.id),
      patientId: String(record.patientId),
      patientName: record.patientFullName,
      documentNumber: record.documentNumber,
      careScope: record.careScope,
      admissionDate: record.admissionDate,
    })
    router.push(`/billing/admissionIntegral?${params.toString()}`)
  }

  return (
    <ActiveAdmissionsTable
      data={admissions}
      loading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      onAction={openAdmission}
      actionLabel="Abrir admisión"
      actionIcon={<ArrowRightOutlined />}
    />
  )
}

export default AdmissionPicker
