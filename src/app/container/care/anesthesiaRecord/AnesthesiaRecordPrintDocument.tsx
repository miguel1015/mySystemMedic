"use client"

import { useMemo } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { RecordAnestesiaResponse } from "@/core/interfaces/care/recordAnestesia"
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
import "./anesthesiaRecord.css"
import { ACTO_ANESTESICO_LABELS, joinDiagnosticos } from "./anesthesiaRecord.utils"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  record: RecordAnestesiaResponse
}

type Row = { label: string; value?: string | null }

// Cada sección se imprime con todas sus filas, aunque estén vacías, para
// conservar la estructura del formato oficial.
const sectionUnits = (key: string, title: string, rows: Row[]): Unit[] =>
  rows.map((row, index) => ({
    kind: "field",
    id: `${key}-${index}`,
    sectionKey: key,
    sectionTitle: title,
    isFirst: index === 0,
    label: row.label,
    value: row.value?.trim() || "",
  }))

export const AnesthesiaRecordPrintDocument = ({
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
      documentTitle="Record de Anestesia"
      attentionDate={formatDate(record.fechaInicio, "")}
      attentionTime={formatTime(record.fechaInicio, "")}
      showSex
    />
  )

  const units = useMemo<Unit[]>(() => {
    const list: Unit[] = [
      ...sectionUnits("fecha", "Fecha y hora", [
        { label: "Fecha", value: formatDate(record.fechaInicio, "") },
        { label: "Hora", value: formatTime(record.fechaInicio, "") },
        { label: "Fecha de terminación", value: formatDateTime(record.fechaTerminacion, "") },
        { label: "Fecha de realización", value: formatDateTime(record.fechaRealizacion, "") },
      ]),
      ...sectionUnits("record", "Record", [
        { label: "Tipo de cirugía", value: record.tipoCirugia },
        { label: "ASA", value: record.asa },
        {
          label: "Diagnóstico prequirúrgico",
          value: joinDiagnosticos([record.idx1Ingreso, record.idx2Ingreso, record.idx3Ingreso]),
        },
        {
          label: "Diagnóstico postquirúrgico",
          value: joinDiagnosticos([record.idx1Egreso, record.idx2Egreso, record.idx3Egreso]),
        },
        { label: "Procedimiento a realizar", value: record.procedimientoARealizar },
        { label: "Procedimiento realizado", value: record.procedimientoRealizado },
        { label: "Cirujano", value: record.nombreCirujano?.toUpperCase() },
        { label: "Tipo de anestesia", value: record.nombreTipoAnestesia },
        { label: "Posición del paciente", value: record.posicionPaciente },
        { label: "Monitoreo ECG", value: record.monitoreoEcg },
        { label: "Observaciones", value: record.observaciones },
        { label: "Condiciones del paciente al ingreso", value: record.condicionesIngreso },
        { label: "Observación", value: record.observacion },
      ]),
      ...sectionUnits("acto", "Acto anestésico", [
        {
          label: "Acto anestésico",
          value: record.actoAnestesico ? ACTO_ANESTESICO_LABELS[record.actoAnestesico] : "",
        },
        { label: "Drogas anestésicas", value: record.drogasAnestesicas },
        { label: "Líquidos", value: record.liquidos },
      ]),
      ...sectionUnits("diagnostico", "Diagnóstico", [
        { label: "Diagnóstico libre", value: record.dxLibre },
      ]),
    ]

    list.push({
      kind: "block",
      id: "firma-anestesiologo",
      node: (
        <div className="anesthesia-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {record.firmaResponsable && (
                <img src={record.firmaResponsable} alt="Firma del anestesiólogo" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {record.nombreResponsable?.toUpperCase() || emptyDash}
              {" / "}
              {record.perfilResponsable || "Anestesiología"}
            </div>
            <div className="hci-print-signature-meta">
              Registro médico N° {record.tarjetaResponsable || emptyDash}
            </div>
            <div className="anesthesia-print-signed">Firmado electrónicamente.</div>
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
