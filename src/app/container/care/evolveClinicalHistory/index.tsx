"use client"

import { useState } from "react"
import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import ActiveAdmissionsTable from "../shared/ActiveAdmissionsTable"
import ActionsModal from "./actionsModal"
import { FileTextOutlined } from "@ant-design/icons"

const EvolveClinicalHistoryContainer = () => {
  const { data: admissions = [], isLoading, isError, refetch } = useActiveAdmissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<ActiveAdmission | null>(null)

  const handleAction = (patient: ActiveAdmission) => {
    setSelectedPatient(patient)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPatient(null)
  }

  return (
    <Container>
      <PageHeader
        icon={<FileTextOutlined />}
        title="Evolucionar historia clínica"
        subtitle={
          isLoading
            ? "Cargando pacientes…"
            : `${admissions.length.toLocaleString("es-CO")} ${admissions.length === 1 ? "paciente con admisión activa" : "pacientes con admisión activa"}`
        }
      />

      <ActiveAdmissionsTable
        data={admissions}
        loading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onAction={handleAction}
        actionLabel="Evolucionar"
        actionIcon={<FileTextOutlined />}
      />

      <ActionsModal
        open={modalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </Container>
  )
}

export default EvolveClinicalHistoryContainer
