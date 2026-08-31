"use client"

import { BillingMovementResponse } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import type { GetPatient } from "@/core/interfaces/care/types"
import type { Insurance, TProvider } from "@/core/interfaces/parameterization/types"
import { Fragment, useMemo } from "react"
import { calculateAge, currencyToWordsEs, formatCurrency, formatDate, formatDateTime } from "../../utils"
import { InvoiceGroup, buildInvoiceGroups } from "../invoicePreviewGroups"
import "./invoicePrintPreview.css"

interface InvoicePrintDocumentProps {
  provider?: TProvider
  admission: AdmissionResponse
  patient?: GetPatient
  insurance?: Insurance
  movements: BillingMovementResponse[]
  invoicePrefix: string
}

const emptyDash = "—"

// TODO: datos mock mientras el formulario de "Datos IPS" no permite editar
// la resolución de facturación electrónica del proveedor.
const mockDianResolution = "18764081843209"
const mockResolutionFromDate = "2024-10-21"
const mockPrefix = "FE"
const mockFromNumber = 1
const mockToNumber = 1000

export const InvoicePrintDocument = ({
  provider,
  admission,
  patient,
  insurance,
  movements,
  invoicePrefix,
}: InvoicePrintDocumentProps) => {
  const groups = useMemo(() => buildInvoiceGroups(movements), [movements])
  const nonEmptyGroups = groups.filter((group: InvoiceGroup) => group.rows.length > 0)
  const grandTotal = groups.reduce((sum, group) => sum + group.subtotal, 0)
  const age = calculateAge(patient?.birthDate, admission.admissionDate)
  const totalInWords = currencyToWordsEs(grandTotal)

  return (
    <div className="invoice-print-page">
      <table className="invoice-print-table">
        <thead>
          <tr>
            <td className="invoice-print-header-cell" colSpan={6}>
              <div className="invoice-print-header">
                <div className="invoice-print-logo">
                  <img src="/assets/img/avatars/logoPdf.png" alt="Logo" />
                </div>
                <div className="invoice-print-entity">
                  <div className="invoice-print-entity-name">
                    {provider?.name || provider?.invoiceIssuerName || "Institución Prestadora de Salud"}
                  </div>
                  {provider?.nit && (
                    <div className="invoice-print-entity-line">
                      NIT: {provider.nit}
                      {provider.verificationDigit ? ` - ${provider.verificationDigit}` : ""}
                    </div>
                  )}
                  {provider?.address && (
                    <div className="invoice-print-entity-line">Dirección: {provider.address}</div>
                  )}
                  {provider?.phone && <div className="invoice-print-entity-line">Tel: {provider.phone}</div>}
                  {provider?.email && <div className="invoice-print-entity-line">Email: {provider.email}</div>}
                  <div className="invoice-print-entity-line">
                    Resolución facturación electrónica - DIAN{" "}
                    {provider?.dianResolution || mockDianResolution}
                    {` de ${(provider?.resolutionFromDate || mockResolutionFromDate).split("T")[0]}`}
                    <br />
                    {`desde ${provider?.prefix || mockPrefix} ${provider?.fromNumber || mockFromNumber} hasta ${provider?.prefix || mockPrefix} ${provider?.toNumber || mockToNumber}`}
                  </div>
                </div>
                <div className="invoice-print-badge">
                  <div className="invoice-print-badge-title">Vista preliminar</div>
                  <div className="invoice-print-badge-number">
                    {invoicePrefix ? `${invoicePrefix}-` : ""}
                    {admission.id}
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td className="invoice-print-header-cell" colSpan={6}>
              <div className="invoice-print-info-grid">
                <div className="invoice-print-row">
                  <span className="invoice-print-label">Nombre del paciente:</span>
                  <span className="invoice-print-value">{admission.nombrePaciente}</span>
                </div>
                <div className="invoice-print-row">
                  <span className="invoice-print-label">Aseguradora:</span>
                  <span className="invoice-print-value">{admission.epsNombre || emptyDash}</span>
                </div>

                <div className="invoice-print-row">
                  <span className="invoice-print-label">Documento del paciente:</span>
                  <span className="invoice-print-value">
                    {admission.documentTypeCode} {admission.documentoPatiente}
                  </span>
                </div>
                <div className="invoice-print-row">
                  <span className="invoice-print-label">NIT del asegurador:</span>
                  <span className="invoice-print-value">{insurance?.nit || emptyDash}</span>
                </div>

                <div className="invoice-print-row">
                  <span className="invoice-print-label">Edad:</span>
                  <span className="invoice-print-value">{age !== null ? `${age} años` : emptyDash}</span>
                </div>
                <div className="invoice-print-row">
                  <span className="invoice-print-label">Convenio:</span>
                  <span className="invoice-print-value">{admission.convenioNombre || emptyDash}</span>
                </div>

                <div className="invoice-print-row">
                  <span className="invoice-print-label">Sexo:</span>
                  <span className="invoice-print-value">{patient?.sexName || emptyDash}</span>
                </div>
                <div className="invoice-print-row">
                  <span className="invoice-print-label">Fecha de facturación:</span>
                  <span className="invoice-print-value">{formatDate(new Date().toISOString())}</span>
                </div>

                <div className="invoice-print-row">
                  <span className="invoice-print-label">Dirección:</span>
                  <span className="invoice-print-value">{patient?.address || emptyDash}</span>
                </div>
                <div className="invoice-print-row">
                  <span className="invoice-print-label">Fecha de atención:</span>
                  <span className="invoice-print-value">{formatDateTime(admission.admissionDate)}</span>
                </div>
              </div>
              <div className="invoice-print-header-rule" />
            </td>
          </tr>

          <tr className="invoice-print-columns">
            <th className="invoice-print-col-number">Item</th>
            <th className="invoice-print-col-code">Código</th>
            <th>Descripción</th>
            <th className="invoice-print-col-qty">Cant.</th>
            <th className="invoice-print-col-unit">Valor Unit.</th>
            <th className="invoice-print-col-total">Valor Total</th>
          </tr>
        </thead>

        <tbody>
          {nonEmptyGroups.length === 0 ? (
            <tr>
              <td colSpan={6} className="invoice-print-empty-note">
                No hay servicios cargados para esta admisión.
              </td>
            </tr>
          ) : (
            nonEmptyGroups.map((group) => (
              <Fragment key={group.key}>
                <tr className="invoice-print-group-title">
                  <td colSpan={6}>{group.label}</td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.key}>
                    <td className="invoice-print-col-number">{row.itemNumber ?? ""}</td>
                    <td className="invoice-print-col-code">{row.code ?? ""}</td>
                    <td
                      className={row.isSubItem ? "invoice-print-subitem" : undefined}
                      style={{ fontWeight: row.isHeader ? 700 : 400 }}
                    >
                      {row.description}
                    </td>
                    <td className="invoice-print-col-qty">{row.quantity ?? ""}</td>
                    <td className="invoice-print-col-unit">
                      {row.unitValue !== null ? formatCurrency(row.unitValue) : ""}
                    </td>
                    <td className="invoice-print-col-total">
                      {row.totalValue !== null ? formatCurrency(row.totalValue) : ""}
                    </td>
                  </tr>
                ))}
                <tr className="invoice-print-subtotal-row">
                  <td colSpan={5}>Subtotal {group.label}</td>
                  <td className="invoice-print-col-total">{formatCurrency(group.subtotal)}</td>
                </tr>
              </Fragment>
            ))
          )}
        </tbody>

        <tfoot>
          <tr>
            <td className="invoice-print-footer-cell" colSpan={6}>
              <div className="invoice-print-totals">
                <div className="invoice-print-totals-box">
                  {nonEmptyGroups.map((group) => (
                    <div className="invoice-print-totals-row" key={group.key}>
                      <span>Subtotal {group.label.toLowerCase()}</span>
                      <span>{formatCurrency(group.subtotal)}</span>
                    </div>
                  ))}
                  <div className="invoice-print-totals-row invoice-print-totals-row--grand">
                    <span>Total factura</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="invoice-print-words">
                <strong>Valor en letras: </strong>
                {totalInWords}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default InvoicePrintDocument
