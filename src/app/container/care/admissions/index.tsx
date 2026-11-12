"use client"

import { Container } from "@/components/container"
import Modal from "@/components/modal"
import PageHeader from "@/components/dataTable/PageHeader"
import { Button, Empty, Input, Select, Space } from "antd"
import { PlusOutlined, SearchOutlined, SolutionOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
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
  const { data: admissions, isFetching, isError, refetch } = useSearchAdmissions(criteria)

  const runSearch = (field: SearchField, rawTerm: string) => {
    const term = rawTerm.trim()
    if (!term) {
      toast.error("Ingrese el documento o el número de admisión")
      return
    }
    if (field === "numero") {
      if (!/^\d+$/.test(term)) {
        toast.error("El número de admisión debe ser numérico")
        return
      }
      setCriteria({ numero: Number(term), soloActivas: true })
    } else {
      setCriteria({ documento: term, soloActivas: true })
    }
    // La búsqueda queda en la URL: al volver de otra vista o compartir el enlace se repite.
    const params = new URLSearchParams(window.location.search)
    params.delete("documento")
    params.delete("numero")
    params.set(field, term)
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}`)
  }

  const handleSearch = () => runSearch(searchField, searchTerm)

  // Repetir la búsqueda que venga en la URL (?documento=… o ?numero=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const field: SearchField | null = params.get("numero")
      ? "numero"
      : params.get("documento")
        ? "documento"
        : null
    if (!field) return
    const term = params.get(field) ?? ""
    setSearchField(field)
    setSearchTerm(term)
    runSearch(field, term)
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <PageHeader
        icon={<SolutionOutlined />}
        title="Admisiones"
        subtitle="Busque las admisiones activas de un paciente o por número"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/care/admissions/new")}
          >
            Nueva admisión
          </Button>
        }
      />

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
          isError={isError}
          onRetry={() => refetch()}
          emptyText={
            "numero" in criteria
              ? `No hay una admisión activa con el N° ${criteria.numero}.`
              : "El paciente no tiene admisiones activas."
          }
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
        title={editingAdmission ? "Editar admisión" : "Nueva admisión"}
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
