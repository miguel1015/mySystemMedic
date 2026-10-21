"use client"

import type { AplicacionOrden, OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import type { DataUser } from "@/core/interfaces/user/users"
import { useMemo } from "react"
import { ClinicalDocumentHeader } from "../clinicalRecords/initialClinicalHistory/printPreview/ClinicalDocumentHeader"
import type { PrintPatient } from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import {
  PaginatedPages,
  usePaginatedUnits,
  type Unit,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printPagination"
import "../clinicalRecords/initialClinicalHistory/printPreview/hciPrintPreview.css"
import "./medicationApplicationPrint.css"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  ordenes: OrdenActiva[]
  profesionalesById: Map<number, DataUser | undefined>
  printedAt: Date
}

const pad = (n: number) => n.toString().padStart(2, "0")

const formatFechaHora = (value: string) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const h = d.getHours() % 12 || 12
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${d.getHours() < 12 ? "AM" : "PM"}`
}

const formatQty = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "")

// Órdenes con al menos una aplicación, con sus aplicaciones de la más antigua a
// la más reciente, como en el formato impreso.
export const ordenesConAplicaciones = (ordenes: OrdenActiva[]) =>
  ordenes
    .filter((o) => o.aplicaciones?.length)
    .map((o) => ({
      ...o,
      aplicaciones: [...o.aplicaciones].sort(
        (a, b) => new Date(a.fechaHoraAplicacion).getTime() - new Date(b.fechaHoraAplicacion).getTime(),
      ),
    }))

export const MedicationApplicationPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  ordenes,
  profesionalesById,
  printedAt,
}: Props) => {
  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Aplicación de Medicamentos"
      attentionLabel="Fecha de impresión:"
      attentionDate={`${pad(printedAt.getDate())}/${pad(printedAt.getMonth() + 1)}/${printedAt.getFullYear()}`}
      attentionTime={`${pad(printedAt.getHours())}:${pad(printedAt.getMinutes())}`}
    />
  )

  const units = useMemo<Unit[]>(() => {
    const renderAplicacion = (orden: OrdenActiva, a: AplicacionOrden) => {
      const esMedicamento = orden.tipoOrden === "Medicamento"
      const detalle = [
        formatFechaHora(a.fechaHoraAplicacion),
        esMedicamento
          ? `${formatQty(a.cantidad)}${a.unidadMedida ? ` ${a.unidadMedida}` : ""}`
          : `Cant.: ${formatQty(a.cantidad)}`,
        esMedicamento ? `${a.unidadesConsumidas} und.` : "",
        a.viaAdministracion?.toUpperCase() ?? "",
        a.ambito,
      ]
        .filter(Boolean)
        .join(" | ")
      const nota = [orden.frecuenciaHoras ? `C/${orden.frecuenciaHoras}H` : "", a.observaciones ?? ""]
        .filter(Boolean)
        .join(" · ")
      const firma = profesionalesById.get(a.profesionalId)?.signature

      return (
        <div className="ma-print-app">
          <div>
            <strong>{esMedicamento ? "Fecha/Hora aplicación:" : "Fecha/Hora realización:"}</strong> {detalle}
          </div>
          {nota && <div>{nota}</div>}
          {firma && <img className="ma-print-signature" src={firma} alt="Firma" />}
          <div>
            <strong>{esMedicamento ? "Aplicado por:" : "Realizado por:"}</strong> {a.profesionalNombre}
          </div>
        </div>
      )
    }

    return ordenesConAplicaciones(ordenes).flatMap((orden): Unit[] => [
      {
        kind: "block",
        id: `orden-${orden.ordenMedicaItemId}`,
        node: (
          <div className="ma-print-order-title">
            {orden.codigo} - {orden.descripcion}
          </div>
        ),
      },
      ...orden.aplicaciones.map((a): Unit => ({
        kind: "block",
        id: `aplicacion-${a.id}`,
        node: renderAplicacion(orden, a),
      })),
    ])
  }, [ordenes, profesionalesById])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  )
}
