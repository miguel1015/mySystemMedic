"use client"

import { useActiveAdmissions } from "@/core/hooks/care/admissions/useGetActiveAdmissions"
import { ActiveAdmission } from "@/core/interfaces/care/types"
import { ArrowRightOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Input, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const CARE_SCOPE_COLORS: Record<string, string> = {
  Urgencia: "red",
  Hospitalización: "blue",
  "Consulta externa": "green",
  Cirugía: "purple",
}

const AdmissionPicker = () => {
  const router = useRouter()
  const { data: admissions = [], isLoading } = useActiveAdmissions()
  const [search, setSearch] = useState("")

  const filteredData = useMemo(() => {
    if (!search.trim()) return admissions
    const term = search.toLowerCase()
    return admissions.filter(
      (item) =>
        item.patientFullName.toLowerCase().includes(term) ||
        item.documentNumber.toLowerCase().includes(term) ||
        item.careScope.toLowerCase().includes(term),
    )
  }, [search, admissions])

  const openAdmission = (record: ActiveAdmission) => {
    const params = new URLSearchParams({
      admissionId: String(record.id),
      patientId: String(record.patientId),
      patientName: record.patientFullName,
      documentNumber: record.documentNumber,
      careScope: record.careScope,
      admissionDate: record.admissionDate,
    })
    router.push(`/billing/admissionIntegral?${params.toString()}`)
  }

  const columns: ColumnsType<ActiveAdmission> = [
    {
      title: "Admisión",
      dataIndex: "id",
      width: 100,
      render: (value: number) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>#{value}</span>
      ),
    },
    {
      title: "Fecha y hora de admisión",
      dataIndex: "admissionDate",
      width: 190,
      sorter: (a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime(),
      render: (value: string) => {
        const date = new Date(value)
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {date.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" })}
            </div>
            <div style={{ fontSize: 12, color: "var(--dash-text-secondary, #6b7280)" }}>
              {date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )
      },
    },
    {
      title: "Nombre completo",
      dataIndex: "patientFullName",
      sorter: (a, b) => a.patientFullName.localeCompare(b.patientFullName),
      render: (value: string) => <span style={{ fontWeight: 500 }}>{value}</span>,
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
      render: (value: string) => <Tag color={CARE_SCOPE_COLORS[value] || "default"}>{value}</Tag>,
    },
    {
      title: "",
      key: "action",
      width: 140,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => openAdmission(record)}>
          Abrir
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre, documento o ámbito..."
          prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          disabled={isLoading}
          style={{ maxWidth: 480, borderRadius: 8 }}
        />
      </div>
      <Table<ActiveAdmission>
        size="middle"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={{ spinning: isLoading, tip: "Cargando admisiones activas..." }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} pacientes`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay pacientes con admisión activa" }}
      />
    </div>
  )
}

export default AdmissionPicker
