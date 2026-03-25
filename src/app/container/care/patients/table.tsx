"use client"

import { Button, Input, Space, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import { SearchOutlined } from "@ant-design/icons"
import ModalConfirm from "@/components/modalConfirmation.tsx"
import toast from "react-hot-toast"

export interface PatientRow {
  id: number;
  documentType: string;
  documentNumber: string;
  fullName: string;
  eps: string;
  phone: string;
  email: string;
  birthDate: string;
}

const MOCK_PATIENTS: PatientRow[] = [
  {
    id: 1,
    documentType: "CC",
    documentNumber: "1001234567",
    fullName: "Juan Carlos Pérez López",
    eps: "Sura EPS",
    phone: "3001234567",
    email: "juan.perez@email.com",
    birthDate: "1990-05-15",
  },
  {
    id: 2,
    documentType: "CC",
    documentNumber: "1009876543",
    fullName: "María Fernanda Gómez Ríos",
    eps: "Nueva EPS",
    phone: "3109876543",
    email: "maria.gomez@email.com",
    birthDate: "1985-11-22",
  },
  {
    id: 3,
    documentType: "TI",
    documentNumber: "1052345678",
    fullName: "Andrés Felipe Martínez Díaz",
    eps: "Sanitas",
    phone: "3201112233",
    email: "andres.martinez@email.com",
    birthDate: "2005-03-10",
  },
  {
    id: 4,
    documentType: "CE",
    documentNumber: "E123456",
    fullName: "Laura Sofía Rodríguez Vargas",
    eps: "Compensar",
    phone: "3154567890",
    email: "laura.rodriguez@email.com",
    birthDate: "1978-08-01",
  },
  {
    id: 5,
    documentType: "CC",
    documentNumber: "1007654321",
    fullName: "Carlos Eduardo Sánchez Ruiz",
    eps: "Famisanar",
    phone: "3006543210",
    email: "carlos.sanchez@email.com",
    birthDate: "1995-12-30",
  },
]

interface PatientsTableProps {
  onEdit: (id: number) => void;
}

export default function PatientsTable({ onEdit }: PatientsTableProps) {
  const [search, setSearch] = useState("")
  const [openConfirm, setOpenConfirm] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null)

  const filteredPatients = useMemo(() => {
    const term = search.toLowerCase()
    return MOCK_PATIENTS.filter(
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.documentNumber.toLowerCase().includes(term) ||
        p.eps.toLowerCase().includes(term),
    )
  }, [search])

  const columns: ColumnsType<PatientRow> = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_v, _r, index) => (
        <span style={{ fontWeight: 600, color: "var(--dash-text-secondary, #6b7280)" }}>{index + 1}</span>
      ),
    },
    {
      title: "Tipo Doc.",
      dataIndex: "documentType",
      width: 100,
    },
    {
      title: "Documento",
      dataIndex: "documentNumber",
      width: 140,
      render: (value: string) => (
        <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "Nombre completo",
      dataIndex: "fullName",
      width: 280,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (value: string) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "EPS",
      dataIndex: "eps",
      width: 160,
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },
    {
      title: "Acciones",
      width: 180,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record.id)}>
            Editar
          </Button>
          <Button
            danger
            onClick={() => {
              setPatientToDelete(record.id)
              setOpenConfirm(true)
            }}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Buscar por nombre, documento o EPS..."
          prefix={<SearchOutlined style={{ color: "var(--theme-primary, #0F6F5C)" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 480, borderRadius: 8 }}
        />
      </div>

      <Table<PatientRow>
        size="middle"
        columns={columns}
        dataSource={filteredPatients}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} pacientes`,
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "No hay pacientes registrados" }}
      />

      <ModalConfirm
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        title="Eliminar paciente"
        subtitle="¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer."
        onConfirm={() => {
          toast.success("Solo visual: eliminar paciente no disponible aún")
          setOpenConfirm(false)
          setPatientToDelete(null)
        }}
      />
    </div>
  )
}
