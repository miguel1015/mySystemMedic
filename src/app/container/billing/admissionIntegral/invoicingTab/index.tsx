"use client"

import { useCreateElectronicInvoice } from "@/core/hooks/care/billing/useCreateElectronicInvoice"
import { BillingMovementResponse, BillingMovementType, ElectronicInvoiceResponse } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import {
  CheckCircleFilled,
  EyeOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
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
  electronicInvoice: ElectronicInvoiceResponse | null | undefined
  isLoadingElectronicInvoice: boolean
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

const InvoicingTab = ({
  admission,
  movements,
  electronicInvoice,
  isLoadingElectronicInvoice,
}: InvoicingTabProps) => {
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
  // TODO: RIPS aún no se está validando en este flujo; por ahora la facturación
  // electrónica solo depende de que haya movimientos cargados.
  const canElectronicInvoice = hasMovements

  const createElectronicInvoice = useCreateElectronicInvoice()

  const isAlreadyIssued = electronicInvoice?.success ?? false

  const handleElectronicInvoice = async () => {
    if (!canElectronicInvoice || !admission) return

    try {
      const result = await createElectronicInvoice.mutateAsync(admission.id)
      if (result.success) {
        messageApi.success(`Factura electrónica emitida. CUFE: ${result.cufe}`)
      } else {
        messageApi.error(
          result.errorMessage || "La DIAN rechazó la factura electrónica.",
        )
      }
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo emitir la factura electrónica.")
    }
  }

  const handleViewPdf = () => {
    if (!electronicInvoice) return
    if (electronicInvoice.pdfUrl) {
      window.open(electronicInvoice.pdfUrl, "_blank", "noopener,noreferrer")
    } else if (electronicInvoice.pdfBase64) {
      window.open(`data:application/pdf;base64,${electronicInvoice.pdfBase64}`, "_blank", "noopener,noreferrer")
    }
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
        {isAlreadyIssued ? (
          <Button
            size="large"
            icon={<FilePdfOutlined />}
            onClick={handleViewPdf}
            disabled={!electronicInvoice?.pdfUrl && !electronicInvoice?.pdfBase64}
          >
            Ver factura electrónica (CUFE: {electronicInvoice?.cufe})
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleElectronicInvoice}
            loading={createElectronicInvoice.isPending}
            disabled={!canElectronicInvoice || isLoadingElectronicInvoice}
          >
            Facturación electrónica
          </Button>
        )}
      </div>

      {isAlreadyIssued && (
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--dash-text-secondary, #6b7280)" }}>
          <CheckCircleFilled style={{ color: "#16a34a", marginRight: 6 }} />
          Esta admisión ya fue facturada electrónicamente.
        </p>
      )}

      {!isAlreadyIssued && !canElectronicInvoice && (
        <p style={{ marginTop: 10, fontSize: 13, color: "var(--dash-text-tertiary, #9ca3af)" }}>
          <FileDoneOutlined /> Para habilitar la facturación electrónica, carga al menos un
          movimiento de facturación.
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
