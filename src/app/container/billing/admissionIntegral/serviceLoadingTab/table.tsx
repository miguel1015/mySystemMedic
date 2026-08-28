"use client"

import ModalConfirm from "@/components/modalConfirmation.tsx"
import { useDeleteBillingMovement } from "@/core/hooks/care/billing/useDeleteBillingMovement"
import { BillingMovementResponse, BillingMovementType } from "@/core/interfaces/care/billing"
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { Button, Empty, Space, Table, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import toast from "react-hot-toast"
import { useState } from "react"
import { formatCurrency } from "../utils"

interface MovementsTableProps {
  movements: BillingMovementResponse[]
  admissionId: number
  loading: boolean
  onEdit: (movement: BillingMovementResponse) => void
}

const MOVEMENT_TYPE_LABELS: Record<BillingMovementType, string> = {
  service: "Servicio",
  medicine: "Medicamento",
  supply: "Insumo",
  surgery: "Cirugía",
}

const MOVEMENT_TYPE_COLORS: Record<BillingMovementType, string> = {
  service: "blue",
  medicine: "green",
  supply: "purple",
  surgery: "gold",
}

const MovementsTable = ({ movements, admissionId, loading, onEdit }: MovementsTableProps) => {
  const deleteMovement = useDeleteBillingMovement()
  const [toDelete, setToDelete] = useState<BillingMovementResponse | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return

    deleteMovement.mutate(
      { id: toDelete.id, admissionId },
      {
        onSuccess: () => {
          toast.success("Movimiento eliminado correctamente.")
          setToDelete(null)
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo eliminar el movimiento")
        },
      },
    )
  }

  const columns: ColumnsType<BillingMovementResponse> = [
    {
      title: "Nombre del servicio / elemento",
      dataIndex: "name",
      render: (value: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          {record.serviceCategory && (
            <div style={{ fontSize: 12, color: "var(--dash-text-tertiary, #9ca3af)" }}>
              {record.serviceCategory}
            </div>
          )}
        </div>
      ),
    },
    { title: "Cantidad", dataIndex: "quantity", width: 100, align: "center" },
    {
      title: "Valor unitario",
      dataIndex: "unitValue",
      width: 150,
      align: "right",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Valor total",
      dataIndex: "totalValue",
      width: 150,
      align: "right",
      render: (_, record) => (
        <span style={{ fontWeight: 700 }}>
          {formatCurrency(record.totalValue ?? record.quantity * record.unitValue)}
        </span>
      ),
    },
    {
      title: "Tipo de servicio",
      dataIndex: "movementType",
      width: 140,
      render: (value: BillingMovementType) => (
        <Tag color={MOVEMENT_TYPE_COLORS[value]}>{MOVEMENT_TYPE_LABELS[value]}</Tag>
      ),
    },
    {
      title: "Convenio",
      dataIndex: "contractName",
      width: 200,
      render: (value: string | null) => value || "Sin convenio",
    },
    {
      title: "Acciones",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button danger icon={<DeleteOutlined />} onClick={() => setToDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table<BillingMovementResponse>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={movements}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"] }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <Empty description="No hay movimientos cargados para esta admisión" /> }}
      />

      <ModalConfirm
        open={!!toDelete}
        title="Eliminar movimiento"
        subtitle={`¿Confirma eliminar "${toDelete?.name}" de los movimientos de la admisión? Esta acción no se puede deshacer.`}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteMovement.isPending}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  )
}

export default MovementsTable
