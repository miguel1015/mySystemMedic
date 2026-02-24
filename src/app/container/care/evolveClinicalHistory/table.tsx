"use client"

import { Button, Input, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { SearchOutlined, SettingOutlined } from "@ant-design/icons"
import { ActiveAdmission } from "@/core/interfaces/care/types"

interface AdmissionsTableProps {
  data: ActiveAdmission[];
  loading: boolean;
  onAction: (patient: ActiveAdmission) => void;
}

const AdmissionsTable = ({ data, loading, onAction }: AdmissionsTableProps) => {
  const [search, setSearch] = useState("")

  const filteredData = useMemo(() => {
    if (!search.trim()) return data
    const term = search.toLowerCase()
    return data.filter(
      (item) =>
        item.patientFullName.toLowerCase().includes(term) ||
        item.documentNumber.toLowerCase().includes(term) ||
        item.careScope.toLowerCase().includes(term),
    )
  }, [search, data])

  const columns: ColumnsType<ActiveAdmission> = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_value, _record, index) => (
        <span style={{ fontWeight: 600, color: "#888" }}>{index + 1}</span>
      ),
    },
    {
      title: "Fecha y hora de admisión",
      dataIndex: "admissionDate",
      width: 200,
      sorter: (a, b) =>
        new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime(),
      render: (value: string) => {
        const date = new Date(value)
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {date.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {date.toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )
      },
    },
    {
      title: "Nombre completo",
      dataIndex: "patientFullName",
      width: 280,
      sorter: (a, b) => a.patientFullName.localeCompare(b.patientFullName),
      render: (value: string) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Nro. Documento",
      dataIndex: "documentNumber",
      width: 160,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Ámbito de atención",
      dataIndex: "careScope",
      width: 180,
      filters: [
        { text: "Urgencia", value: "Urgencia" },
        { text: "Hospitalización", value: "Hospitalización" },
        { text: "Consulta externa", value: "Consulta externa" },
        { text: "Cirugía", value: "Cirugía" },
      ],
      onFilter: (value, record) => record.careScope === value,
      render: (value: string) => {
        const colorMap: Record<string, string> = {
          Urgencia: "red",
          Hospitalización: "blue",
          "Consulta externa": "green",
          Cirugía: "purple",
        }
        return <Tag color={colorMap[value] || "default"}>{value}</Tag>
      },
    },
    {
      title: "Acciones",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={() => onAction(record)}
          style={{
            backgroundColor: "#0F6F5C",
            borderColor: "#0F6F5C",
            borderRadius: 8,
          }}
        >
          Acciones
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre, documento o ámbito..."
          prefix={<SearchOutlined style={{ color: "#0F6F5C" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={loading}
          style={{ maxWidth: 480, borderRadius: 8 }}
        />
      </div>
      <Table<ActiveAdmission>
        size="middle"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={{ spinning: loading, tip: "Cargando admisiones activas..." }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} pacientes`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay pacientes con admisión activa" }}
      />
    </div>
  )
}

export default AdmissionsTable
