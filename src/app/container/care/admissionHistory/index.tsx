"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Button, Input, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { HistoryOutlined, SearchOutlined } from "@ant-design/icons"
import { useState } from "react"
import { AdmissionHistoryPatient } from "@/core/interfaces/care/types"
import { useGetAdmissionHistoryPatients } from "@/core/hooks/care/admissions/useAdmissionHistory"
import { formatDateTime } from "@/core/utils/date"
import PatientAdmissionsModal from "./patientAdmissionsModal"

export default function AdmissionHistoryContainer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] =
    useState<AdmissionHistoryPatient | null>(null)
  const { data: patients = [], isFetching } = useGetAdmissionHistoryPatients(search)

  const columns: ColumnsType<AdmissionHistoryPatient> = [
    {
      title: "Documento",
      key: "documento",
      render: (_, r) => `${r.documentTypeCode} ${r.documentoPatiente}`,
    },
    { title: "Paciente", dataIndex: "nombrePaciente", key: "nombrePaciente" },
    { title: "EPS (última admisión cerrada)", dataIndex: "epsNombre", key: "epsNombre" },
    {
      title: "Admisiones cerradas",
      key: "admisiones",
      align: "center",
      render: (_, r) => <Tag color="green">{r.totalAdmisiones}</Tag>,
    },
    {
      title: "Última admisión cerrada",
      dataIndex: "ultimaAdmision",
      key: "ultimaAdmision",
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Historial",
      key: "historial",
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="Ver admisiones del paciente">
          <Button
            type="text"
            icon={<HistoryOutlined style={{ fontSize: 18 }} />}
            onClick={() => setSelectedPatient(r)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <Container>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <HistoryOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Historial de admisiones</Title>
      </div>

      <Input.Search
        size="large"
        placeholder="Buscar por documento o nombre del paciente"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onSearch={(value) => setSearch(value.trim())}
        enterButton={<Button type="primary" icon={<SearchOutlined />}>Buscar</Button>}
        loading={isFetching}
        allowClear
        style={{ maxWidth: 640, marginBottom: 16 }}
      />

      <Table<AdmissionHistoryPatient>
        size="middle"
        columns={columns}
        dataSource={patients}
        loading={isFetching}
        rowKey="patientId"
        pagination={patients.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay pacientes con admisiones cerradas para los criterios de búsqueda" }}
      />

      <PatientAdmissionsModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </Container>
  )
}
