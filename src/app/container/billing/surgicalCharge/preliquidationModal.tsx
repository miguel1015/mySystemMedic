"use client"

import Modal from "@/components/modal"
import { Button, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { SelectedSurgicalService, PreliquidatedConcept } from "./useSurgicalChargeForm"
import { formatCurrency, formatFactor } from "./utils"

interface PreliquidationModalProps {
  open: boolean
  onClose: () => void
  service: SelectedSurgicalService | null
  concepts: PreliquidatedConcept[]
  isSaving: boolean
  onAccept: () => void
}

const PreliquidationModal = ({
  open,
  onClose,
  service,
  concepts,
  isSaving,
  onAccept,
}: PreliquidationModalProps) => {
  const columns: ColumnsType<PreliquidatedConcept> = [
    { title: "Código", dataIndex: "referenceCode", width: 90 },
    { title: "Nombre", dataIndex: "description" },
    { title: "Valor base", dataIndex: "value", width: 110, render: (v: number) => formatCurrency(v) },
    { title: "Unidad", dataIndex: "factors", width: 90, render: (v: number) => formatFactor(v) },
    {
      title: "Valor sin redondeos",
      dataIndex: "rawValue",
      width: 150,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: "Valor redondeado",
      dataIndex: "roundedValue",
      width: 150,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: "Valor porcentaje",
      dataIndex: "percentageValue",
      width: 140,
      render: (v: number) => formatCurrency(v),
    },
    {
      title: "Porcentaje cobrado",
      dataIndex: "percentageApplied",
      width: 130,
      render: (v: number) => `${v}%`,
    },
  ]

  const total = concepts.reduce((sum, c) => sum + c.percentageValue, 0)

  return (
    <Modal open={open} onClose={onClose} title="Preliquidación de la cirugía" size="xl">
      {service && (
        <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <Tag color="blue">Código {service.code}</Tag>
          <span style={{ fontWeight: 700 }}>{service.name}</span>
          {service.surgicalGroupQxGroup && <Tag>Grupo QX: {service.surgicalGroupQxGroup}</Tag>}
        </div>
      )}

      <Table<PreliquidatedConcept>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={concepts}
        pagination={false}
        scroll={{ x: 900 }}
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
        <span style={{ fontWeight: 600 }}>Valor total a cargar</span>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{formatCurrency(total)}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cerrar
        </Button>
        <Button type="primary" onClick={onAccept} loading={isSaving} disabled={isSaving}>
          Aceptar
        </Button>
      </div>
    </Modal>
  )
}

export default PreliquidationModal
