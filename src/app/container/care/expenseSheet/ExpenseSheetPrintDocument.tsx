"use client"

import type { DataUser } from "@/core/interfaces/user/users"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { HojaGastoRegistro, TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import { useMemo } from "react"
import { ClinicalDocumentHeader } from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalDocumentHeader"
import {
  DoctorSignatureBox,
  type PrintPatient,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import {
  PaginatedPages,
  usePaginatedUnits,
  type Unit,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printPagination"
import { consolidarRegistros, firmantesDe, HOJA_TEXTOS } from "./expenseSheet.utils"
import "../clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import "./expenseSheetPrint.css"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  tipoHoja: TipoHojaGastos
  registros: HojaGastoRegistro[]
  firmantesById: Map<number, DataUser | undefined>
  printedAt: Date
}

const pad = (n: number) => n.toString().padStart(2, "0")

export const ExpenseSheetPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  tipoHoja,
  registros,
  firmantesById,
  printedAt,
}: Props) => {
  const headerBlock = (
    <>
      <ClinicalDocumentHeader
        provider={provider}
        patient={patient}
        admissionId={admissionId}
        admissionDate={admissionDate}
        contractName={contractName}
        documentTitle={HOJA_TEXTOS[tipoHoja].tituloImpresion}
        attentionLabel="Fecha de impresión:"
        attentionDate={`${pad(printedAt.getDate())}/${pad(printedAt.getMonth() + 1)}/${printedAt.getFullYear()}`}
        attentionTime={`${pad(printedAt.getHours())}:${pad(printedAt.getMinutes())}`}
      />
      <div className="es-print-row es-print-row--head">
        <span>Ítem</span>
        <span>Tipo</span>
        <span>Servicio</span>
        <span className="es-print-qty">Cantidad</span>
      </div>
    </>
  )

  const units = useMemo<Unit[]>(() => {
    const conceptos = consolidarRegistros(registros)
    const filas: Unit[] = conceptos.map((c, index) => ({
      kind: "block",
      id: c.key,
      node: (
        <div className="es-print-row">
          <span>{index + 1}</span>
          <span>{c.tipo}</span>
          <span>
            {c.codigo} - {c.descripcion}
          </span>
          <span className="es-print-qty">{c.cantidad}</span>
        </div>
      ),
    }))

    const firmas: Unit = {
      kind: "block",
      id: "firmas",
      node: (
        <div className="hci-print-signatures">
          {firmantesDe(registros).map((f) => (
            <DoctorSignatureBox key={f.id} doctorName={f.nombre} doctorUser={firmantesById.get(f.id)} />
          ))}
        </div>
      ),
    }

    return [...filas, firmas]
  }, [registros, firmantesById])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  )
}
