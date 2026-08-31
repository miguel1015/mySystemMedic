"use client"

import { BillingMovementResponse, BillingMovementType } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import {
  EyeOutlined,
  FileDoneOutlined,
  SendOutlined,
} from "@ant-design/icons"
import { Button, DatePicker, Descriptions, Input, Skeleton, message } from "antd"
import type { Dayjs } from "dayjs"
import { useMemo, useState } from "react"
import { RipsValidationResult } from "../ripsTab"
import { formatCurrency } from "../utils"
import InvoicePrintPreviewModal from "./printPreview/InvoicePrintPreviewModal"

interface InvoicingTabProps {
  admission: AdmissionResponse | undefined
  movements: BillingMovementResponse[]
  ripsValidation: RipsValidationResult | null
}

const MOVEMENT_TYPE_LABELS: Record<BillingMovementType, string> = {
  service: "Servicios",
  medicine: "Medicamentos",
  supply: "Insumos",
  surgery: "Cirugía",
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 10,
  padding: "18px 20px",
  marginBottom: 20,
}

const InvoicingTab = ({ admission, movements, ripsValidation }: InvoicingTabProps) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [serviceStartDate, setServiceStartDate] = useState<Dayjs | null>(null)
  const [serviceEndDate, setServiceEndDate] = useState<Dayjs | null>(null)
  const [invoicePrefix, setInvoicePrefix] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)

  const totals = useMemo(() => {
    const byType: Record<BillingMovementType, number> = { service: 0, medicine: 0, supply: 0, surgery: 0 }

    movements.forEach((movement) => {
      byType[movement.movementType] += movement.totalValue ?? movement.quantity * movement.unitValue
    })

    const subtotalGeneral = byType.service + byType.medicine + byType.supply + byType.surgery

    return { byType, subtotalGeneral, total: subtotalGeneral }
  }, [movements])

  const hasMovements = movements.length > 0
  const isRipsValid = ripsValidation?.isValid ?? false
  const canElectronicInvoice = hasMovements && isRipsValid

  const handleElectronicInvoice = () => {
    if (!canElectronicInvoice) return
    messageApi.info(
      "Facturación electrónica: próximamente. La integración con el proveedor de facturación electrónica está en desarrollo.",
    )
  }

  if (!admission) {
    return <Skeleton active paragraph={{ rows: 4 }} />
  }

  return (
    <div>
      {contextHolder}

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Información del servicio</h6>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Fecha de inicio del servicio</span>
            <DatePicker
              value={serviceStartDate}
              onChange={setServiceStartDate}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Fecha de fin del servicio</span>
            <DatePicker
              value={serviceEndDate}
              onChange={setServiceEndDate}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Prefijo de factura</span>
            <Input
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="Ej. FEV"
            />
          </label>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Información del paciente</h6>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 4 }}
          items={[
            { key: "patientName", label: "Nombre completo", children: admission.nombrePaciente },
            { key: "admissionId", label: "Número de admisión", children: `#${admission.id}` },
            { key: "eps", label: "EPS", children: admission.epsNombre || "Sin EPS" },
            { key: "contract", label: "Convenio", children: admission.convenioNombre || "Sin convenio" },
          ]}
        />
      </div>

      <div style={sectionCardStyle}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Resumen financiero</h6>
        <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
          {(Object.keys(MOVEMENT_TYPE_LABELS) as BillingMovementType[]).map((type) => (
            <div key={type} style={{ display: "flex", justifyContent: "space-between", color: "var(--dash-text-secondary, #6b7280)" }}>
              <span>{MOVEMENT_TYPE_LABELS[type]}</span>
              <span>{formatCurrency(totals.byType[type])}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--dash-border, #e5e7eb)" }}>
            <span style={{ fontWeight: 600 }}>Subtotal general</span>
            <span style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotalGeneral)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "var(--theme-primary, #0F6F5C)" }}>
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button
          size="large"
          icon={<EyeOutlined />}
          onClick={() => setPreviewOpen(true)}
          disabled={!hasMovements}
        >
          Previsualizar factura
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleElectronicInvoice}
          disabled={!canElectronicInvoice}
        >
          Facturación electrónica
        </Button>
      </div>

      {!canElectronicInvoice && (
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--dash-text-tertiary, #9ca3af)" }}>
          <FileDoneOutlined /> Para habilitar la facturación electrónica, carga al menos un
          movimiento y valida la información RIPS desde el tab RIPS.
        </p>
      )}

      <InvoicePrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        admission={admission}
        movements={movements}
        invoicePrefix={invoicePrefix}
      />
    </div>
  )
}

export default InvoicingTab
