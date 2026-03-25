"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import Modal from "@/components/modal"
import { Button } from "antd"
import { useState } from "react"
import { UserOutlined } from "@ant-design/icons"
import PatientsForm from "./patientsForm"
import PatientsTable from "./table"

export default function PatientsContainer() {
  const [open, setOpen] = useState(false)
  const [editPatientId, setEditPatientId] = useState<number | null>(null)

  const handleEdit = (id: number) => {
    setEditPatientId(id)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditPatientId(null)
  }

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Pacientes</Title>
        </div>
        <Button onClick={() => setOpen(true)} type="primary">
          Nuevo Paciente
        </Button>
      </div>

      <PatientsTable onEdit={handleEdit} />

      <Modal
        open={open}
        onClose={handleClose}
        title={editPatientId ? "Editar paciente" : "Nuevo paciente"}
        size="xl"
      >
        <PatientsForm
          setOpen={setOpen}
          editPatientId={editPatientId}
          setEditPatientId={setEditPatientId}
        />
      </Modal>
    </Container>
  )
}
