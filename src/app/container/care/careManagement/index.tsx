"use client"

import { SearchOutlined } from "@ant-design/icons"
import { Alert, Button, Empty, Input, Select, Space, Spin, Tag, message } from "antd"
import Title from "antd/es/typography/Title"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Container } from "@/components/container"
import {
  useSearchClinicalHistory,
  type ClinicalHistorySearchCriteria,
} from "@/core/hooks/care/clinicalHistory/useClinicalHistory"
import type { ClinicalHistorySearchBy } from "@/core/interfaces/care/clinicalHistory"
import { formatDateTime } from "@/core/utils/date"
import AdmissionClinicalRecord from "./AdmissionClinicalRecord"
import "./careManagement.css"

// Admisiones visibles antes de "Ver todas".
const ADMISSIONS_PREVIEW = 6

const SEARCH_OPTIONS: { value: ClinicalHistorySearchBy; label: string; placeholder: string }[] = [
  { value: "documento", label: "Documento", placeholder: "Número de documento del paciente" },
  { value: "numero", label: "N° de admisión", placeholder: "Número de admisión" },
]

// La HC consulta muchos módulos: caché propia con un solo reintento (una consulta que
// falla no deja la vista cargando varios segundos) y sin recargar al volver a la ventana.
const CareManagementContainer = () => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <ClinicalHistoryView />
    </QueryClientProvider>
  )
}

// Consultar HC: ubica al paciente por documento o número de admisión, lista sus
// admisiones y muestra la historia clínica de la que se seleccione.
const ClinicalHistoryView = () => {
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()

  // Desde otras vistas se puede abrir directamente una admisión (?admissionId=).
  const initialAdmissionId = searchParams.get("admissionId")
  const [searchBy, setSearchBy] = useState<ClinicalHistorySearchBy>(initialAdmissionId ? "numero" : "documento")
  const [term, setTerm] = useState(initialAdmissionId ?? "")
  const [criteria, setCriteria] = useState<ClinicalHistorySearchCriteria | null>(
    initialAdmissionId ? { by: "numero", value: initialAdmissionId } : null,
  )
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null)
  const [showAllAdmissions, setShowAllAdmissions] = useState(false)

  const { data: result, isFetching, isError } = useSearchClinicalHistory(criteria)

  // Con una sola admisión (o al buscar por número) se abre directamente.
  useEffect(() => {
    setSelectedAdmissionId(result?.admisiones.length === 1 ? result.admisiones[0].id : null)
    setShowAllAdmissions(false)
  }, [result])

  const handleSearch = () => {
    const value = term.trim()
    if (!value) {
      messageApi.warning("Ingrese el documento del paciente o el número de admisión.")
      return
    }
    if (searchBy === "numero" && !/^\d+$/.test(value)) {
      messageApi.warning("El número de admisión debe ser numérico.")
      return
    }
    setCriteria({ by: searchBy, value })
  }

  const admissions = result?.admisiones ?? []
  const selectedAdmission = admissions.find((a) => a.id === selectedAdmissionId)
  // La admisión seleccionada siempre queda a la vista aunque esté más allá del corte.
  const visibleAdmissions =
    showAllAdmissions || admissions.length <= ADMISSIONS_PREVIEW
      ? admissions
      : admissions.filter((a, i) => i < ADMISSIONS_PREVIEW || a.id === selectedAdmissionId)

  const placeholder = SEARCH_OPTIONS.find((o) => o.value === searchBy)?.placeholder

  return (
    <Container>
      {contextHolder}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)", fontSize: 18 }} />
        <Title level={4} style={{ margin: 0 }}>
          Consultar Historia Clínica
        </Title>
      </div>

      <Space.Compact className="chv-search">
        <Select
          value={searchBy}
          onChange={setSearchBy}
          options={SEARCH_OPTIONS.map(({ value, label }) => ({ value, label }))}
          style={{ width: 150, flex: "0 0 150px" }}
        />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onPressEnter={handleSearch}
          placeholder={placeholder}
          allowClear
          maxLength={30}
        />
        <Button type="primary" icon={<SearchOutlined />} loading={isFetching} onClick={handleSearch}>
          Buscar
        </Button>
      </Space.Compact>

      {isError && (
        <Alert type="error" showIcon style={{ marginBottom: 16 }} message="No se pudo consultar la historia clínica. Intente de nuevo." />
      )}

      {criteria && !isFetching && result === null && (
        <Empty description="No existen registros para los datos ingresados." style={{ padding: 40 }} />
      )}

      {isFetching && !result && (
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      )}

      {result && (
        <>
          <div style={{ marginBottom: 8, fontSize: 13, color: "var(--dash-text-secondary)" }}>
            {admissions.length} {admissions.length === 1 ? "admisión" : "admisiones"} de{" "}
            <strong style={{ color: "var(--dash-text-primary)" }}>{result.nombrePaciente}</strong> ·{" "}
            {result.documentTypeCode} {result.documentoPaciente}
          </div>
          <div className="chv-admissions" role="radiogroup" aria-label="Admisiones del paciente">
            {visibleAdmissions.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={a.id === selectedAdmissionId}
                className={`chv-admission${a.id === selectedAdmissionId ? " active" : ""}`}
                onClick={() => setSelectedAdmissionId(a.id)}
              >
                <span className="chv-admission-top">
                  <span>N° {a.id}</span>
                  <Tag color={a.cerrada ? "red" : "green"} style={{ marginInlineEnd: 0 }}>
                    {a.cerrada ? "Cerrada" : "Abierta"}
                  </Tag>
                </span>
                <span className="chv-admission-meta">{formatDateTime(a.admissionDate)}</span>
                <span className="chv-admission-meta">
                  {[a.careScopeName, a.epsNombre].filter(Boolean).join(" · ") || a.admissionTypeName}
                </span>
              </button>
            ))}
          </div>
          <div className="chv-more">
            {admissions.length > ADMISSIONS_PREVIEW && (
              <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setShowAllAdmissions((v) => !v)}>
                {showAllAdmissions ? "Ver menos" : `Ver todas (${admissions.length})`}
              </Button>
            )}
          </div>

          {selectedAdmission ? (
            <AdmissionClinicalRecord
              key={selectedAdmission.id}
              admission={selectedAdmission}
              patient={result}
              messageApi={messageApi}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Seleccione una admisión para consultar su historia clínica."
            />
          )}
        </>
      )}
    </Container>
  )
}

export default CareManagementContainer
