"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import Title from "@/components/title"
import { Button, Empty, Input, Select, Space } from "antd"
import { SearchOutlined, SolutionOutlined } from "@ant-design/icons"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import AdmissionsForm from "./admissionsForm"
import AdmissionsTable from "./table"
import AdmissionHistoryModal from "./admissionHistoryModal"
import CompanionForm from "./companionForm"
import ReferralForm from "./referralForm"
import FuripsForm from "@/app/container/billing/furips/FuripsForm"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import {
  AdmissionSearchCriteria,
  useSearchAdmissions,
} from "@/core/hooks/care/admissions/useSearchAdmissions"

type SearchField = "documento" | "numero"

const SEARCH_FIELD_OPTIONS = [
  { value: "documento", label: "Documento del paciente" },
  { value: "numero", label: "N° de admisión" },
]

export default function AdmissionsContainer() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingAdmission, setEditingAdmission] =
    useState<AdmissionResponse | null>(null)
  const [historyAdmission, setHistoryAdmission] =
    useState<AdmissionResponse | null>(null)
  const [furipsAdmission, setFuripsAdmission] =
    useState<AdmissionResponse | null>(null)
  const [companionAdmission, setCompanionAdmission] =
    useState<AdmissionResponse | null>(null)
  const [referralAdmission, setReferralAdmission] =
    useState<AdmissionResponse | null>(null)
  const [searchField, setSearchField] = useState<SearchField>("documento")
  const [searchTerm, setSearchTerm] = useState("")
  const [criteria, setCriteria] = useState<AdmissionSearchCriteria | null>(null)
  const { data: admissions, isFetching } = useSearchAdmissions(criteria)

  const handleSearch = () => {
    const term = searchTerm.trim()
    if (!term) {
      toast.error("Ingrese el documento o el número de admisión")
      return
    }
    if (searchField === "numero") {
      if (!/^\d+$/.test(term)) {
        toast.error("El número de admisión debe ser numérico")
        return
      }
      setCriteria({ numero: Number(term), soloActivas: true })
    } else {
      setCriteria({ documento: term, soloActivas: true })
    }
  }

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

      <Space.Compact style={{ width: "100%", maxWidth: 640, marginBottom: 16 }}>
        <Select
          size="large"
          value={searchField}
          options={SEARCH_FIELD_OPTIONS}
          onChange={(value: SearchField) => setSearchField(value)}
          style={{ width: 220 }}
        />
        <Input
          size="large"
          placeholder={
            searchField === "numero"
              ? "Ingrese el número de admisión"
              : "Ingrese el número de documento"
          }
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onPressEnter={handleSearch}
          allowClear
        />
        <Button
          size="large"
          type="primary"
          icon={<SearchOutlined />}
          loading={isFetching}
          onClick={handleSearch}
        >
          Buscar
        </Button>
      </Space.Compact>

      {criteria ? (
        <AdmissionsTable
          data={admissions ?? []}
          isLoading={isFetching}
          onEdit={handleEdit}
          onHistory={setHistoryAdmission}
          onFurips={setFuripsAdmission}
          onCompanion={setCompanionAdmission}
          onReferral={setReferralAdmission}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Busque una admisión por documento del paciente o número de admisión"
          style={{ padding: 40 }}
        />
      )}

      <Modal
        open={open}
        onClose={handleClose}
        title={editingAdmission ? "Editar admision" : "Nueva admision"}
        size="xl"
      >
        <AdmissionsForm initialAdmission={editingAdmission} onDone={handleClose} />
      </Modal>

      <Modal
        open={!!furipsAdmission}
        onClose={() => setFuripsAdmission(null)}
        title={
          furipsAdmission
            ? `Información del accidente (FURIPS) · Admisión ${furipsAdmission.id} · ${furipsAdmission.nombrePaciente}`
            : "Información del accidente (FURIPS)"
        }
        size="xl"
      >
        {furipsAdmission && (
          <FuripsForm
            key={furipsAdmission.id}
            admissionId={furipsAdmission.id}
            mode="admission"
            onClose={() => setFuripsAdmission(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!companionAdmission}
        onClose={() => setCompanionAdmission(null)}
        title={
          companionAdmission
            ? `Acompañante del paciente · Admisión ${companionAdmission.id} · ${companionAdmission.nombrePaciente}`
            : "Acompañante del paciente"
        }
        size="md"
      >
        {companionAdmission && (
          <CompanionForm
            key={companionAdmission.id}
            admissionId={companionAdmission.id}
            patientId={companionAdmission.patientId}
            onClose={() => setCompanionAdmission(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!referralAdmission}
        onClose={() => setReferralAdmission(null)}
        title={
          referralAdmission
            ? `Remisión · Admisión ${referralAdmission.id} · ${referralAdmission.nombrePaciente}`
            : "Remisión"
        }
        size="lg"
      >
        {referralAdmission && (
          <ReferralForm
            key={referralAdmission.id}
            admission={referralAdmission}
            onClose={() => setReferralAdmission(null)}
          />
        )}
      </Modal>

      <AdmissionHistoryModal
        admission={historyAdmission}
        onClose={() => setHistoryAdmission(null)}
      />
    </Container>
  )
}
