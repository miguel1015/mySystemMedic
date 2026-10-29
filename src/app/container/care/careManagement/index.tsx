"use client"

import { SearchOutlined } from "@ant-design/icons"
import { Alert, Button, Empty, Input, Segmented, Spin, Table, Tag, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import Title from "antd/es/typography/Title"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Container } from "@/components/container"
import {
  useSearchClinicalHistory,
  type ClinicalHistorySearchCriteria,
} from "@/core/hooks/care/clinicalHistory/useClinicalHistory"
import type {
  ClinicalHistoryAdmission,
  ClinicalHistorySearchBy,
} from "@/core/interfaces/care/clinicalHistory"
import { formatDateTime } from "@/core/utils/date"
import AdmissionClinicalRecord from "./AdmissionClinicalRecord"

const SEARCH_OPTIONS: { value: ClinicalHistorySearchBy; label: string; placeholder: string }[] = [
  { value: "documento", label: "Documento", placeholder: "Número de documento del paciente" },
  { value: "numero", label: "N° de admisión", placeholder: "Número de admisión" },
]

// Consultar HC: ubica al paciente por documento o número de admisión, lista sus
// admisiones y muestra la historia clínica de la que se seleccione.
const CareManagementContainer = () => {
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

  const { data: result, isFetching, isError } = useSearchClinicalHistory(criteria)

  // Con una sola admisión (o al buscar por número) se abre directamente.
  useEffect(() => {
    setSelectedAdmissionId(result?.admisiones.length === 1 ? result.admisiones[0].id : null)
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

  const selectedAdmission = result?.admisiones.find((a) => a.id === selectedAdmissionId)

  const columns: ColumnsType<ClinicalHistoryAdmission> = [
    { title: "N° admisión", dataIndex: "id", key: "id", width: 120 },
    {
      title: "Fecha de ingreso",
      dataIndex: "admissionDate",
      key: "admissionDate",
      render: (value: string) => formatDateTime(value),
    },
    { title: "Ámbito", dataIndex: "careScopeName", key: "careScopeName", render: (v: string) => v || "—" },
    { title: "Tipo de admisión", dataIndex: "admissionTypeName", key: "admissionTypeName" },
    { title: "EPS", dataIndex: "epsNombre", key: "epsNombre" },
    {
      title: "Estado",
      key: "estado",
      align: "center",
      render: (_, r) =>
        r.cerrada ? <Tag color="red">Cerrada</Tag> : <Tag color="green">Abierta</Tag>,
    },
  ]

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

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <Segmented
          value={searchBy}
          onChange={(value) => setSearchBy(value as ClinicalHistorySearchBy)}
          options={SEARCH_OPTIONS.map(({ value, label }) => ({ value, label }))}
        />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onPressEnter={handleSearch}
          placeholder={placeholder}
          allowClear
          maxLength={30}
          style={{ maxWidth: 360 }}
        />
        <Button type="primary" icon={<SearchOutlined />} loading={isFetching} onClick={handleSearch}>
          Buscar
        </Button>
      </div>

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
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            {result.nombrePaciente} · {result.documentTypeCode} {result.documentoPaciente}
          </div>
          <Table<ClinicalHistoryAdmission>
            size="small"
            columns={columns}
            dataSource={result.admisiones}
            rowKey="id"
            pagination={result.admisiones.length > 5 ? { pageSize: 5, showSizeChanger: false } : false}
            scroll={{ x: "max-content" }}
            rowSelection={{
              type: "radio",
              selectedRowKeys: selectedAdmissionId ? [selectedAdmissionId] : [],
              onChange: (keys) => setSelectedAdmissionId(Number(keys[0])),
            }}
            onRow={(r) => ({ onClick: () => setSelectedAdmissionId(r.id), style: { cursor: "pointer" } })}
            style={{ marginBottom: 20 }}
          />

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
