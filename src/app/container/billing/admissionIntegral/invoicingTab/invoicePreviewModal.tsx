"use client"

import Modal from "@/components/modal"
import { BillingMovementResponse, BillingMovementType } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { formatCurrency, formatDate } from "../utils"

interface InvoicePreviewModalProps {
  open: boolean
  onClose: () => void
  admission: AdmissionResponse
  movements: BillingMovementResponse[]
  serviceStartDate: string | null
  serviceEndDate: string | null
  invoicePrefix: string
  subtotalGeneral: number
  total: number
}

const MOVEMENT_TYPE_LABELS: Record<BillingMovementType, string> = {
  service: "Servicio",
  medicine: "Medicamento",
  supply: "Insumo",
  surgery: "Cirugía",
}

const InvoicePreviewModal = ({
  open,
  onClose,
  admission,
  movements,
  serviceStartDate,
  serviceEndDate,
  invoicePrefix,
  subtotalGeneral,
  total,
}: InvoicePreviewModalProps) => {
  const columns: ColumnsType<BillingMovementResponse> = [
    { title: "Nombre", dataIndex: "name" },
    {
      title: "Tipo",
      dataIndex: "movementType",
      width: 120,
      render: (value: BillingMovementType) => <Tag>{MOVEMENT_TYPE_LABELS[value]}</Tag>,
    },
    { title: "Cant.", dataIndex: "quantity", width: 70, align: "center" },
    {
      title: "Valor unitario",
      dataIndex: "unitValue",
      width: 130,
      align: "right",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Valor total",
      key: "total",
      width: 130,
      align: "right",
      render: (_, record) => formatCurrency(record.totalValue ?? record.quantity * record.unitValue),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Previsualización de factura" size="xl">
      <div style={{ border: "1px solid #1f2937", borderRadius: 4, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #d1d5db",
            paddingBottom: 14,
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>CLINICA FUNDACION IPS SAS</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>NIT: 900517542-5</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>
              Factura {invoicePrefix || "S/N"}-{admission.id}
            </div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>
              Periodo: {formatDate(serviceStartDate)} — {formatDate(serviceEndDate)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Paciente</div>
            <div style={{ fontWeight: 600 }}>{admission.nombrePaciente}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Documento</div>
            <div style={{ fontWeight: 600 }}>{admission.documentoPatiente}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Admisión</div>
            <div style={{ fontWeight: 600 }}>#{admission.id}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>EPS</div>
            <div style={{ fontWeight: 600 }}>{admission.epsNombre || "Sin EPS"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Convenio</div>
            <div style={{ fontWeight: 600 }}>{admission.convenioNombre || "Sin convenio"}</div>
          </div>
        </div>

        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={movements}
          pagination={false}
          scroll={{ x: 620 }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Subtotal general</span>
              <span>{formatCurrency(subtotalGeneral)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderTop: "1px solid #1f2937",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default InvoicePreviewModal
