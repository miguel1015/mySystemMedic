"use client"

import { useMemo } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import { formatDate, formatDateTime, formatTime } from "@/core/utils/date"
import { ClinicalDocumentHeader } from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalDocumentHeader"
import {
  emptyDash,
  type PrintPatient,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import {
  PaginatedPages,
  usePaginatedUnits,
  type Unit,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printPagination"
import "../clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import "./labSheet.css"
import { findLabStudy, formatReference, formatResultValue } from "./labStudies"
import type { LabRecord } from "./types"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  record: LabRecord
}

export const LabResultPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  record,
}: Props) => {
  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Resultado de Laboratorio"
      attentionDate={formatDate(record.fechaToma, "")}
      attentionTime={formatTime(record.fechaToma, "")}
      showSex
    />
  )

  const units = useMemo<Unit[]>(() => {
    const study = findLabStudy(record.studyId)

    const list: Unit[] = [
      { label: "Estudio realizado", value: `${record.studyCode} - ${record.studyName}` },
      { label: "Fecha y hora de toma", value: formatDateTime(record.fechaToma, "") },
      { label: "Fecha del registro", value: formatDateTime(record.updatedAt, "") },
      { label: "Personal de salud", value: record.professionalName },
    ].map((row, index) => ({
      kind: "field" as const,
      id: `estudio-${index}`,
      sectionKey: "estudio",
      sectionTitle: "Datos del estudio",
      isFirst: index === 0,
      label: row.label,
      value: row.value,
    }))

    const rows = (study?.fields ?? []).map((field) => ({
      field,
      value: formatResultValue(field, record.resultados[field.key]),
    }))

    list.push({
      kind: "block",
      id: "resultados",
      node: (
        <div className="hci-print-section">
          <div className="hci-print-section-title">Resultados</div>
          <table className="lab-print-results">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>Parámetro</th>
                <th>Resultado</th>
                <th style={{ width: "24%" }}>Valor de referencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ field, value }) => (
                <tr key={field.key}>
                  <td>{field.label}</td>
                  <td className={field.type === "textarea" ? "lab-print-multiline" : undefined}>
                    {value || emptyDash}
                  </td>
                  <td>{formatReference(field) || emptyDash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    })

    list.push({
      kind: "block",
      id: "firma-profesional",
      node: (
        <div className="lab-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {record.professionalSignature && (
                <img src={record.professionalSignature} alt="Firma del profesional" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {record.professionalName?.toUpperCase() || emptyDash}
            </div>
            <div className="hci-print-signature-meta">
              {record.professionalProfile || "Personal de salud"}
            </div>
            <div className="hci-print-signature-meta">
              Tarjeta profesional N° {record.professionalLicense || emptyDash}
            </div>
          </div>
        </div>
      ),
    })

    return list
  }, [record])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} showPageNumbers />
    </>
  )
}
