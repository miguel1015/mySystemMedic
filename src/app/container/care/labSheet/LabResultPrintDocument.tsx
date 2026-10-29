"use client"

import { useMemo } from "react"
import type {
  EstudioCatalogo,
  ResultadoAnalitoResponse,
  ResultadoLaboratorioResponse,
} from "@/core/interfaces/care/laboratorio"
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
import { STATUS_LABEL, absoluteCount, formatNumber, fromResultRequests, labStatus } from "./labResults.utils"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  record: ResultadoLaboratorioResponse
  // Catálogo del estudio: da las secciones, los decimales y los valores críticos.
  study?: EstudioCatalogo
}

export const LabResultPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  record,
  study,
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
    const values = fromResultRequests(record.resultados)

    const list: Unit[] = [
      { label: "Estudio realizado", value: `${record.codigoEstudio} - ${record.nombreEstudio}` },
      { label: "Fecha y hora de toma", value: formatDateTime(record.fechaToma, "") },
      { label: "Fecha del registro", value: formatDateTime(record.updatedAt, "") },
      { label: "Profesional responsable", value: record.nombreProfesional },
    ].map((row, index) => ({
      kind: "field" as const,
      id: `estudio-${index}`,
      sectionKey: "estudio",
      sectionTitle: "Datos del estudio",
      isFirst: index === 0,
      label: row.label,
      value: row.value,
    }))

    // Las filas se agrupan por las secciones del catálogo; lo que no esté en él va al final.
    const sections = study?.secciones ?? []
    const sectionOf = (r: ResultadoAnalitoResponse) =>
      study?.analitos.find((a) => a.clave === r.clave)?.seccion ?? ""
    const groups = [...sections, ""]
      .map((title) => ({ title, rows: record.resultados.filter((r) => sectionOf(r) === title) }))
      .filter((g) => g.rows.length > 0)

    const renderValue = (r: ResultadoAnalitoResponse) => {
      if (r.texto) return { text: r.texto, flag: "" }
      if (r.valor === null) return { text: "", flag: "" }

      const analito = study?.analitos.find((a) => a.clave === r.clave)
      // El rango es el que se guardó con el resultado; los críticos vienen del catálogo.
      const status = labStatus(
        {
          referenciaMin: r.referenciaMin,
          referenciaMax: r.referenciaMax,
          criticoBajo: analito?.criticoBajo ?? null,
          criticoAlto: analito?.criticoAlto ?? null,
        },
        r.valor,
      )
      const absolute = absoluteCount(values, r.clave)
      return {
        text:
          formatNumber(r.valor, analito?.decimales) +
          (absolute !== null ? ` (≈ ${formatNumber(absolute, 0)} /mm³)` : ""),
        flag: status && status !== "normal" ? STATUS_LABEL[status] : "",
      }
    }

    // Cada fila es una unidad propia: así la tabla llena la página y solo pasa a la
    // siguiente lo que no cabe, en lugar de saltar completa.
    list.push({
      kind: "block",
      id: "resultados-encabezado",
      node: (
        <div className="hci-print-section lab-print-results-start">
          <div className="hci-print-section-title">Resultados</div>
          <div className="lab-print-row lab-print-row--head">
            <span>Analito</span>
            <span>Resultado</span>
            <span>Unidad</span>
            <span>Valores de referencia</span>
          </div>
        </div>
      ),
    })

    groups.forEach((group) => {
      if (group.title) {
        list.push({
          kind: "block",
          id: `seccion-${group.title}`,
          node: <div className="lab-print-row lab-print-row--section">{group.title}</div>,
        })
      }
      group.rows.forEach((r) => {
        const { text, flag } = renderValue(r)
        list.push({
          kind: "block",
          id: `analito-${r.clave}`,
          node: (
            <div className="lab-print-row">
              <span>{r.nombre}</span>
              <span className={flag ? "lab-print-flagged" : undefined}>
                {text || emptyDash}
                {flag && ` · ${flag}`}
              </span>
              <span>{r.texto ? emptyDash : r.unidad || emptyDash}</span>
              <span>{r.referencia || emptyDash}</span>
            </div>
          ),
        })
      })
    })

    if (record.observaciones) {
      list.push({
        kind: "block",
        id: "observaciones",
        node: (
          <div className="hci-print-section">
            <div className="hci-print-section-title">Observaciones</div>
            <div className="lab-print-multiline">{record.observaciones}</div>
          </div>
        ),
      })
    }

    list.push({
      kind: "block",
      id: "firma-profesional",
      node: (
        <div className="lab-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {record.firmaProfesional && (
                <img src={record.firmaProfesional} alt="Firma del profesional" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {record.nombreProfesional?.toUpperCase() || emptyDash}
            </div>
            <div className="hci-print-signature-meta">
              {record.perfilProfesional || "Personal de salud"}
            </div>
            <div className="hci-print-signature-meta">
              Tarjeta profesional N° {record.tarjetaProfesional || emptyDash}
            </div>
          </div>
        </div>
      ),
    })

    return list
  }, [record, study])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} showPageNumbers />
    </>
  )
}
