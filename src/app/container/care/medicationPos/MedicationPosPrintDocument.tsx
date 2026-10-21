"use client"

import { useMemo } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { MedicamentoPos } from "@/core/interfaces/care/medicamentoPos"
import { ClinicalDocumentHeader } from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalDocumentHeader"
import {
  emptyDash,
  formatDateTime,
  type PrintPatient,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import {
  PaginatedPages,
  usePaginatedUnits,
  type Unit,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printPagination"
import "../clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import "../medicalOrders/medicalOrders.css"
import "./medicationPos.css"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  formula: MedicamentoPos
  generatedAt: string
}

const ItemsHeader = () => (
  <div className="mp-print-row mp-print-row--head">
    <span>Ítem</span>
    <span>Código CUM</span>
    <span>Medicamento</span>
    <span>Forma</span>
    <span>Concentración</span>
    <span>Dosis</span>
    <span>Vía</span>
    <span>Frecuencia</span>
    <span>Duración</span>
    <span className="mp-print-center">Cantidad</span>
    <span>Indicación</span>
  </div>
)

export const MedicationPosPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  formula,
  generatedAt,
}: Props) => {
  const formulaDateLabel = formatDateTime(formula.fechaFormula)
  const [formulaDate = "", formulaTime = ""] = formulaDateLabel.split(" ")
  const generatedLabel = formatDateTime(generatedAt)

  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Orden de Medicamentos POS"
      attentionLabel="Fecha orden / fórmula:"
      attentionDate={formulaDate}
      attentionTime={formulaTime}
      showSex
    />
  )

  const units = useMemo<Unit[]>(() => {
    const formulaRows = [
      { label: "N° de orden", value: String(formula.id) },
      {
        label: "Profesional que formula",
        value: [formula.asistencialNombre, formula.asistencialEspecialidad].filter(Boolean).join(" - "),
      },
      ...(formula.observaciones ? [{ label: "Observaciones", value: formula.observaciones }] : []),
    ]

    const list: Unit[] = formulaRows.map((row, index) => ({
      kind: "field",
      id: `formula-${index}`,
      sectionKey: "formula",
      sectionTitle: "Información de la orden",
      isFirst: index === 0,
      label: row.label,
      value: row.value,
    }))

    // Un bloque por medicamento para que el paginador pueda partir listas largas;
    // el primero lleva el título y el encabezado de columnas.
    const items = formula.items ?? []
    items.forEach((item, index) => {
      list.push({
        kind: "block",
        id: `item-${item.id}`,
        node: (
          <div className="mp-print-table">
            {index === 0 && (
              <>
                <div className="hci-print-section-title">Medicamentos</div>
                <ItemsHeader />
              </>
            )}
            <div className="mp-print-row">
              <span>{index + 1}</span>
              <span>{item.codigoCum || "Sin CUM"}</span>
              <span>{item.nombre}</span>
              <span>{item.formaFarmaceutica || emptyDash}</span>
              <span>{item.concentracion || emptyDash}</span>
              <span>{item.dosis || emptyDash}</span>
              <span>{item.viaAdministracion}</span>
              <span>{item.frecuenciaHoras ? `${item.frecuenciaHoras} Horas` : emptyDash}</span>
              <span>{item.duracionDias ? `${item.duracionDias} Días` : emptyDash}</span>
              <span className="mp-print-center">{item.cantidad}</span>
              <span>{item.indicacion || emptyDash}</span>
            </div>
          </div>
        ),
      })
    })

    list.push({
      kind: "block",
      id: "firma-asistencial",
      node: (
        <div className="mo-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {formula.asistencialFirma && (
                <img src={formula.asistencialFirma} alt="Firma del asistencial" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {formula.asistencialNombre?.toUpperCase() || emptyDash}
            </div>
            {formula.asistencialEspecialidad && (
              <div className="hci-print-signature-meta">{formula.asistencialEspecialidad}</div>
            )}
            <div className="hci-print-signature-meta">
              Tarjeta profesional N° {formula.asistencialTarjetaProfesional || emptyDash}
            </div>
          </div>
        </div>
      ),
    })

    list.push({
      kind: "block",
      id: "pie-formula",
      node: (
        <div className="hci-print-footer">
          Documento generado el {generatedLabel || emptyDash}
        </div>
      ),
    })

    return list
  }, [formula, generatedLabel])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  )
}
