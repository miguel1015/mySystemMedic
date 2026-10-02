"use client"

import { useMemo } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { EstudioRayosXResponse } from "@/core/interfaces/care/rayosX"
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
import "./xray.css"
import { formatStudyDate } from "./xray.utils"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  estudio: EstudioRayosXResponse
  generatedAt: string
}

// Cada trozo de texto es una unidad independiente para el paginador; así una
// descripción extensa se reparte entre páginas en lugar de desbordar una sola.
const MAX_CHUNK_LENGTH = 700

const splitIntoChunks = (text: string): string[] => {
  const chunks: string[] = []

  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .forEach((paragraph) => {
      let rest = paragraph
      while (rest.length > MAX_CHUNK_LENGTH) {
        const cut = rest.lastIndexOf(" ", MAX_CHUNK_LENGTH)
        const index = cut > MAX_CHUNK_LENGTH / 2 ? cut : MAX_CHUNK_LENGTH
        chunks.push(rest.slice(0, index).trim())
        rest = rest.slice(index).trim()
      }
      if (rest) chunks.push(rest)
    })

  return chunks
}

const textUnits = (key: string, title: string, text: string): Unit[] => {
  const chunks = splitIntoChunks(text ?? "")
  const list = chunks.length > 0 ? chunks : [emptyDash]

  return list.map((chunk, index) => ({
    kind: "block",
    id: `${key}-${index}`,
    node: (
      <div className="hci-print-section xray-print-text-section">
        {index === 0 && <div className="hci-print-section-title">{title}</div>}
        <p className="xray-print-text">{chunk}</p>
      </div>
    ),
  }))
}

export const XrayPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  estudio,
  generatedAt,
}: Props) => {
  const generatedLabel = formatDateTime(generatedAt)
  const [generatedDate = "", generatedTime = ""] = generatedLabel.split(" ")

  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Informe de Estudio Radiológico"
      attentionLabel="Fecha de generación del informe:"
      attentionDate={generatedDate}
      attentionTime={generatedTime}
      showSex
    />
  )

  const units = useMemo<Unit[]>(() => {
    const studyRows = [
      { label: "Fecha del estudio", value: formatStudyDate(estudio.fechaEstudio) },
      {
        label: "Estudio realizado",
        value: [estudio.codigoEstudio, estudio.nombreEstudio].filter(Boolean).join(" - "),
      },
      { label: "Resultado", value: estudio.resultado },
    ]

    const list: Unit[] = studyRows.map((row, index) => ({
      kind: "field",
      id: `estudio-${index}`,
      sectionKey: "estudio",
      sectionTitle: "Datos del estudio",
      isFirst: index === 0,
      label: row.label,
      value: row.value,
    }))

    list.push(...textUnits("descripcion", "Descripción", estudio.descripcion))
    list.push(...textUnits("conclusion", "Conclusión", estudio.conclusion))

    list.push({
      kind: "block",
      id: "firma-radiologo",
      node: (
        <div className="xray-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {estudio.firmaProfesional && (
                <img src={estudio.firmaProfesional} alt="Firma del radiólogo" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {estudio.nombreProfesional?.toUpperCase() || emptyDash}
            </div>
            <div className="hci-print-signature-meta">
              {estudio.perfilProfesional || "Médico radiólogo"}
            </div>
            <div className="hci-print-signature-meta">
              Tarjeta profesional N° {estudio.tarjetaProfesional || emptyDash}
            </div>
          </div>
        </div>
      ),
    })

    list.push({
      kind: "block",
      id: "pie-informe",
      node: (
        <div className="hci-print-footer">
          Informe generado el {generatedLabel || emptyDash}
        </div>
      ),
    })

    return list
  }, [estudio, generatedLabel])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  )
}
