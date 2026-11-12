"use client"

import { Container } from "@/components/container"
import { formatPersonName, formatInstitutionName } from "@/core/utils/displayText"
import DataTable from "@/components/dataTable/DataTable"
import PageHeader from "@/components/dataTable/PageHeader"
import { PersonCell, RowActions, formatDocument } from "@/components/dataTable/cells"
import cellStyles from "@/components/dataTable/dataTable.module.scss"
import { Button, Input } from "antd"
import type { ColumnsType } from "antd/es/table"
import { HistoryOutlined, SearchOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { AdmissionHistoryPatient } from "@/core/interfaces/care/types"
import { useGetAdmissionHistoryPatients } from "@/core/hooks/care/admissions/useAdmissionHistory"
import { formatDateTime } from "@/core/utils/date"
import PatientAdmissionsModal from "./patientAdmissionsModal"

export default function AdmissionHistoryContainer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<AdmissionHistoryPatient | null>(null)
  const { data: patients = [], isFetching, isError, refetch } = useGetAdmissionHistoryPatients(search)

  // La búsqueda en el servidor queda en la URL (?buscar=…): al volver se repite.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("buscar") ?? ""
    if (value) {
      setSearchTerm(value)
      setSearch(value)
    }
  }, [])

  const runSearch = (value: string) => {
    const term = value.trim()
    setSearch(term)
    const params = new URLSearchParams(window.location.search)
    if (term) params.set("buscar", term)
    else params.delete("buscar")
    const qs = params.toString()
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`)
  }

  const historyAction = (r: AdmissionHistoryPatient) => (
    <RowActions
      subject={formatPersonName(r.nombrePaciente)}
      editLabel="Ver admisiones"
      editIcon={<HistoryOutlined />}
      onEdit={() => setSelectedPatient(r)}
    />
  )

  const columns: ColumnsType<AdmissionHistoryPatient> = [
    {
      title: "Paciente",
      key: "patient",
      sorter: (a, b) => a.nombrePaciente.localeCompare(b.nombrePaciente, "es"),
      render: (_, r) => (
        <PersonCell
          name={formatPersonName(r.nombrePaciente)}
          detail={formatDocument(r.documentTypeCode, r.documentoPatiente)}
        />
      ),
    },
    {
      title: "EPS (última admisión cerrada)",
      key: "insurer",
      width: 260,
      render: (_, r) => {
        const eps = formatInstitutionName(r.epsNombre) || "—"
        return (
          <span className={cellStyles.oneLine} title={eps}>
            {eps}
          </span>
        )
      },
    },
    {
      title: "Admisiones cerradas",
      dataIndex: "totalAdmisiones",
      width: 160,
      align: "right",
      sorter: (a, b) => a.totalAdmisiones - b.totalAdmisiones,
      render: (value: number) => <span className={cellStyles.tabular}>{value}</span>,
    },
    {
      title: "Última admisión",
      dataIndex: "ultimaAdmision",
      width: 170,
      defaultSortOrder: "descend",
      sorter: (a, b) => (a.ultimaAdmision ?? "").localeCompare(b.ultimaAdmision ?? ""),
      render: (value: string) => <span className={cellStyles.tabular}>{formatDateTime(value)}</span>,
    },
    {
      title: <span className="visually-hidden">Acciones</span>,
      key: "actions",
      width: 72,
      align: "right",
      fixed: "right",
      render: (_, r) => historyAction(r),
    },
  ]

  return (
    <Container>
      <PageHeader
        icon={<HistoryOutlined />}
        title="Historial de admisiones"
        subtitle="Pacientes con admisiones cerradas (con factura electrónica)"
      />

      <Input.Search
        size="large"
        placeholder="Buscar por documento o nombre del paciente"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onSearch={runSearch}
        enterButton={<Button type="primary" icon={<SearchOutlined />}>Buscar</Button>}
        loading={isFetching}
        allowClear
        style={{ maxWidth: 640, marginBottom: 16 }}
      />

      <DataTable<AdmissionHistoryPatient>
        data={patients}
        columns={columns}
        rowKey="patientId"
        entity={["paciente", "pacientes"]}
        loading={isFetching}
        error={isError}
        onRetry={() => refetch()}
        emptyText={
          search
            ? `Ningún paciente con admisiones cerradas coincide con “${search}”.`
            : "Aún no hay pacientes con admisiones cerradas."
        }
        rowNumbers
        onRowClick={setSelectedPatient}
        renderCard={(p) => (
          <div className={cellStyles.rowCard}>
            <div className={cellStyles.rowCardBody}>
              <PersonCell
                name={formatPersonName(p.nombrePaciente)}
                detail={formatDocument(p.documentTypeCode, p.documentoPatiente)}
              />
              <span className={cellStyles.personDetail}>
                {p.totalAdmisiones} {p.totalAdmisiones === 1 ? "admisión cerrada" : "admisiones cerradas"} · última{" "}
                {formatDateTime(p.ultimaAdmision)}
              </span>
            </div>
            {historyAction(p)}
          </div>
        )}
      />

      <PatientAdmissionsModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </Container>
  )
}
