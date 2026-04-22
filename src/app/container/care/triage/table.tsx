"use client"

import { Button, Input, Select, Space, Table, Spin, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchOutlined } from "@ant-design/icons"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import toast from "react-hot-toast"
import {
  TriagePriority,
  TriageResponse,
} from "@/core/interfaces/care/types"
import { useDeleteTriage } from "@/core/hooks/care/triage/useDeleteTriage"

const PRIORITY_COLOR: Record<TriagePriority, string> = {
  I: "#ff4d4f",
  II: "#fa8c16",
  III: "#fadb14",
  IV: "#52c41a",
  V: "#1890ff",
}

const PRIORITY_OPTIONS: { label: string; value: TriagePriority }[] = [
  { label: "I - Resucitación", value: "I" },
  { label: "II - Emergencia", value: "II" },
  { label: "III - Urgencia", value: "III" },
  { label: "IV - Menos urgente", value: "IV" },
  { label: "V - No urgente", value: "V" },
]

interface TriageTableProps {
  data: TriageResponse[]
  isLoading: boolean
}

export default function TriageTable({ data, isLoading }: TriageTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<TriagePriority | null>(
    null,
  )
  const [openConfirm, setOpenConfirm] = useState(false)
  const [triageToDelete, setTriageToDelete] = useState<number | null>(null)
  const deleteTriage = useDeleteTriage()

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return (data ?? []).filter((t) => {
      const matchesText =
        !term ||
        (t.nombrePaciente ?? "").toLowerCase().includes(term) ||
        (t.numeroDocumento ?? "").toLowerCase().includes(term)
      const matchesPriority =
        !priorityFilter || t.prioridad === priorityFilter
      return matchesText && matchesPriority
    })
  }, [search, priorityFilter, data])

  const handleDelete = () => {
    if (!triageToDelete) return
    deleteTriage.mutate(triageToDelete, {
      onSuccess: () => {
        toast.success("Triaje eliminado correctamente")
        setOpenConfirm(false)
        setTriageToDelete(null)
      },
      onError: (err: Error) => {
        toast.error(err.message)
        setOpenConfirm(false)
        setTriageToDelete(null)
      },
    })
  }

  const columns: ColumnsType<TriageResponse> = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_v, _r, index) => (
        <span
          style={{
            fontWeight: 600,
            color: "var(--dash-text-secondary, #6b7280)",
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Fecha / Hora",
      dataIndex: "fechaHora",
      width: 180,
      sorter: (a, b) =>
        new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
      render: (value: string) => (
        <span style={{ fontFamily: "monospace" }}>
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Documento",
      dataIndex: "numeroDocumento",
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
          {value}
        </span>
      ),
    },
    {
      title: "Paciente",
      dataIndex: "nombrePaciente",
      width: 240,
      sorter: (a, b) =>
        (a.nombrePaciente ?? "").localeCompare(b.nombrePaciente ?? ""),
      render: (value: string) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Prioridad",
      dataIndex: "prioridad",
      width: 120,
      align: "center",
      render: (value: TriagePriority) => (
        <Tag
          style={{
            color: "#fff",
            background: PRIORITY_COLOR[value],
            borderColor: PRIORITY_COLOR[value],
            fontWeight: 600,
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "Motivo",
      dataIndex: "motivoConsulta",
      ellipsis: true,
      render: (value: string) => (
        <span title={value}>
          {value && value.length > 60 ? `${value.slice(0, 60)}…` : value}
        </span>
      ),
    },
    {
      title: "Acciones",
      width: 260,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button onClick={() => router.push(`/care/triage/${record.id}`)}>
            Ver
          </Button>
          <Button
            type="primary"
            onClick={() => router.push(`/care/triage/${record.id}/edit`)}
          >
            Editar
          </Button>
          <Button
            danger
            onClick={() => {
              setTriageToDelete(record.id)
              setOpenConfirm(true)
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Buscar por documento o nombre..."
          prefix={
            <SearchOutlined
              style={{ color: "var(--theme-primary, #0F6F5C)" }}
            />
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 380, borderRadius: 8 }}
        />
        <Select<TriagePriority>
          placeholder="Filtrar por prioridad"
          value={priorityFilter ?? undefined}
          onChange={(v) => setPriorityFilter(v ?? null)}
          allowClear
          size="large"
          style={{ minWidth: 220 }}
          options={PRIORITY_OPTIONS}
        />
      </div>

      <Table<TriageResponse>
        size="middle"
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} triajes`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay triajes registrados" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar triaje"
        subtitle="¿Estás seguro de eliminar este triaje? Esta acción no se puede deshacer."
        loading={deleteTriage.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
