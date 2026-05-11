"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import Title from "@/components/title"
import { Button } from "antd"
import { SolutionOutlined } from "@ant-design/icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AdmissionsForm from "./admissionsForm"
import AdmissionsTable from "./table"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { useGetAllAdmissions } from "@/core/hooks/care/admissions/useGetAllAdmissions"

export default function AdmissionsContainer() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingAdmission, setEditingAdmission] =
    useState<AdmissionResponse | null>(null)
  const { data: admissions, isLoading } = useGetAllAdmissions()

  const handleEdit = (admission: AdmissionResponse) => {
    setEditingAdmission(admission)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingAdmission(null)
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
          <SolutionOutlined
            style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }}
          />
          <Title level={3}>Admisiones</Title>
        </div>
        <Button type="primary" onClick={() => router.push("/care/admissions/new")}>
          Nueva admision
        </Button>
      </div>

      <AdmissionsTable
        data={admissions ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <Modal
        open={open}
        onClose={handleClose}
        title={editingAdmission ? "Editar admision" : "Nueva admision"}
        size="xl"
      >
        <AdmissionsForm initialAdmission={editingAdmission} onDone={handleClose} />
      </Modal>
    </Container>
  )
}
