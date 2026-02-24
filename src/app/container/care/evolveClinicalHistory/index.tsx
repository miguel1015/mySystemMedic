"use client"

import { useState } from "react"
import { Container } from "@/components/container"
import Title from "@/components/title"
import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import AdmissionsTable from "./table"
import ActionsModal from "./actionsModal"
import { FileTextOutlined } from "@ant-design/icons"

const EvolveClinicalHistoryContainer = () => {
  const { data: admissions = [], isLoading } = useActiveAdmissions()
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <FileTextOutlined style={{ fontSize: 22, color: "#0F6F5C" }} />
        <Title level={3}>Evolucionar Historia Clínica</Title>
      </div>

      <p style={{ color: "#666", marginBottom: 24, marginTop: -8 }}>
        Pacientes con admisión activa
      </p>

      <AdmissionsTable
        data={admissions}
        loading={isLoading}
        onAction={handleAction}
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
