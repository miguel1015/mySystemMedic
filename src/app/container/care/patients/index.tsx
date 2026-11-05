"use client"

import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import Modal from "@/components/modal"
import { Button } from "antd"
import { useState } from "react"
import { PlusOutlined, UserOutlined } from "@ant-design/icons"
import PatientsForm from "./patientsForm"
import PatientsTable from "./table"
import { useGetAllPatients } from "@/core/hooks/care/patients/useGetAllPatients"

export default function PatientsContainer() {
  const [open, setOpen] = useState(false)
  const [editPatientId, setEditPatientId] = useState<number | null>(null)
  const { data: patients, isLoading, isError, refetch } = useGetAllPatients()
  const total = patients?.length ?? 0

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
      <PageHeader
        icon={<UserOutlined />}
        title="Pacientes"
        subtitle={
          isLoading
            ? "Cargando pacientes…"
            : `${total.toLocaleString("es-CO")} ${total === 1 ? "paciente registrado" : "pacientes registrados"}`
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Nuevo paciente
          </Button>
        }
      />

      <PatientsTable
        data={patients ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onEdit={handleEdit}
        onCreate={() => setOpen(true)}
      />

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
