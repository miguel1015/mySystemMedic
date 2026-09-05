"use client"

import Modal from "@/components/modal"
import { useUpdateBillingMovement } from "@/core/hooks/care/billing/useUpdateBillingMovement"
import {
  BillingMovementResponse,
  SurgicalConceptDetail,
  parseConceptDetails,
  serializeConceptDetails,
} from "@/core/interfaces/care/billing"
import { DeleteOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, InputNumber, Table, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { formatCurrency } from "../utils"

interface SurgicalMovementEditModalProps {
  open: boolean
  admissionId: number
  movement: BillingMovementResponse | null
  onClose: () => void
  onSaved: () => void
}

const SurgicalMovementEditModal = ({
  open,
  admissionId,
  movement,
  onClose,
  onSaved,
}: SurgicalMovementEditModalProps) => {
  const [concepts, setConcepts] = useState<SurgicalConceptDetail[]>([])
  const updateMovement = useUpdateBillingMovement()

  useEffect(() => {
    if (movement) {
      setConcepts(parseConceptDetails(movement.conceptDetails))
    }
  }, [movement])

  if (!movement) return null

  const total = concepts.reduce((sum, c) => sum + c.unitValue, 0)

  const handleValueChange = (itemId: number, value: number | null) => {
    setConcepts((prev) =>
      prev.map((c) => (c.itemId === itemId ? { ...c, unitValue: value ?? 0 } : c)),
    )
  }

  const handleRemove = (itemId: number) => {
    setConcepts((prev) => prev.filter((c) => c.itemId !== itemId))
  }

  const handleSave = () => {
    if (concepts.length === 0) {
      toast.error("Debe quedar al menos un concepto. Para retirar toda la cirugía, elimine la fila.")
      return
    }

    updateMovement.mutate(
      {
        id: movement.id,
        admissionId,
        data: {
          movementType: movement.movementType,
          itemId: movement.itemId,
          itemCode: movement.itemCode,
          name: movement.name,
          quantity: movement.quantity,
          unitValue: total,
          contractId: movement.contractId,
          serviceCategory: movement.serviceCategory,
          conceptType: movement.conceptType,
          conceptDetails: serializeConceptDetails(concepts),
          notes: movement.notes,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cirugía actualizada correctamente.")
          onSaved()
        },
        onError: (err: Error) => {
          toast.error(err.message || "No se pudo actualizar la cirugía.")
        },
      },
    )
  }

  const columns: ColumnsType<SurgicalConceptDetail> = [
    { title: "Código", dataIndex: "code", width: 90 },
    {
      title: "Nombre",
      dataIndex: "label",
      render: (_, record) => (
        <div>
          <div>{record.label}</div>
          {record.qxGroup && (
            <div style={{ fontSize: 12, color: "var(--dash-text-tertiary, #9ca3af)" }}>
              {record.qxGroup}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "%",
      dataIndex: "percentageApplied",
      width: 70,
      render: (value?: number) => (value != null ? `${value}%` : "—"),
    },
    {
      title: "Valor",
      dataIndex: "unitValue",
      width: 180,
      render: (value: number, record) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          style={{ width: "100%" }}
          onChange={(v) => handleValueChange(record.itemId, v)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Tooltip title="Quitar concepto">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(record.itemId)}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Editar cirugía" size="xl">
      <div style={{ marginBottom: 16, fontWeight: 700 }}>{movement.name}</div>

      <Table<SurgicalConceptDetail>
        rowKey="itemId"
        size="small"
        columns={columns}
        dataSource={concepts}
        pagination={false}
        scroll={{ x: 670 }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: 8,
          background: "rgba(15, 111, 92, 0.06)",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 600 }}>Valor total</span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{formatCurrency(total)}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={onClose} disabled={updateMovement.isPending}>
          Cancelar
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={updateMovement.isPending}
          disabled={updateMovement.isPending}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  )
}

export default SurgicalMovementEditModal
