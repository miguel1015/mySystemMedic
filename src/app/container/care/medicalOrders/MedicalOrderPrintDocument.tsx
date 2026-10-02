"use client"

import { useMemo } from "react"
import type { TProvider } from "@/core/interfaces/parameterization/types"
import {
  TIPOS_ORDEN,
  type OrdenMedica,
  type OrdenMedicaItem,
  type TipoOrden,
} from "@/core/interfaces/care/ordenMedica"
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
import "./medicalOrders.css"

interface Props {
  provider?: TProvider
  patient: PrintPatient
  admissionId?: string | number
  admissionDate: string
  contractName: string
  orden: OrdenMedica
  generatedAt: string
}

const GROUP_TITLES: Record<TipoOrden, string> = {
  Medicamento: "Medicamentos",
  Laboratorio: "Laboratorios",
  "Rayos X": "Rayos X",
  "Procedimiento diagnóstico": "Procedimientos diagnósticos",
  Procedimiento: "Procedimientos",
  "Otro servicio": "Otros servicios",
}

// Para medicamentos se antepone vía, frecuencia y duración a las indicaciones.
const describeIndicaciones = (item: OrdenMedicaItem) =>
  [
    item.viaAdministracion ? `Vía ${item.viaAdministracion.toLowerCase()}` : "",
    item.frecuenciaHoras ? `c/${item.frecuenciaHoras} h` : "",
    item.duracionDias ? `por ${item.duracionDias} día(s)` : "",
    item.indicaciones ?? "",
  ]
    .filter(Boolean)
    .join(" · ")

const ItemsHeader = () => (
  <div className="mo-print-row mo-print-row--head">
    <span>Código</span>
    <span>Descripción</span>
    <span>Cant.</span>
    <span>Indicaciones</span>
  </div>
)

export const MedicalOrderPrintDocument = ({
  provider,
  patient,
  admissionId,
  admissionDate,
  contractName,
  orden,
  generatedAt,
}: Props) => {
  const orderDateLabel = formatDateTime(orden.fechaOrden)
  const [orderDate = "", orderTime = ""] = orderDateLabel.split(" ")
  const generatedLabel = formatDateTime(generatedAt)

  const headerBlock = (
    <ClinicalDocumentHeader
      provider={provider}
      patient={patient}
      admissionId={admissionId}
      admissionDate={admissionDate}
      contractName={contractName}
      documentTitle="Orden Médica"
      attentionLabel="Fecha y hora de la orden:"
      attentionDate={orderDate}
      attentionTime={orderTime}
      showSex
    />
  )

  const units = useMemo<Unit[]>(() => {
    const orderRows = [
      { label: "N° de orden", value: String(orden.id) },
      { label: "Ámbito de la orden", value: orden.ambito },
      {
        label: "Asistencial que ordena",
        value: [orden.asistencialNombre, orden.asistencialEspecialidad].filter(Boolean).join(" - "),
      },
      ...(orden.observaciones ? [{ label: "Observaciones", value: orden.observaciones }] : []),
    ]

    const list: Unit[] = orderRows.map((row, index) => ({
      kind: "field",
      id: `orden-${index}`,
      sectionKey: "orden",
      sectionTitle: "Información de la orden",
      isFirst: index === 0,
      label: row.label,
      value: row.value,
    }))

    // Un bloque por concepto para que el paginador pueda partir listas largas;
    // el primero de cada tipo lleva el título del grupo y el encabezado de columnas.
    TIPOS_ORDEN.forEach((tipo) => {
      const items = (orden.items ?? []).filter((item) => item.tipoOrden === tipo)
      items.forEach((item, index) => {
        list.push({
          kind: "block",
          id: `item-${item.id}`,
          node: (
            <div className="mo-print-group">
              {index === 0 && (
                <>
                  <div className="hci-print-section-title">{GROUP_TITLES[tipo]}</div>
                  <ItemsHeader />
                </>
              )}
              <div className="mo-print-row">
                <span>{item.codigo}</span>
                <span>{item.descripcion}</span>
                <span className="mo-print-qty">
                  {item.cantidad}
                  {item.unidadMedida ? ` ${item.unidadMedida}` : ""}
                </span>
                <span>{describeIndicaciones(item) || emptyDash}</span>
              </div>
            </div>
          ),
        })
      })
    })

    list.push({
      kind: "block",
      id: "firma-asistencial",
      node: (
        <div className="mo-print-signature">
          <div className="hci-print-signature-box">
            <div className="hci-print-signature-img">
              {orden.asistencialFirma && (
                <img src={orden.asistencialFirma} alt="Firma del asistencial" />
              )}
            </div>
            <div className="hci-print-signature-line">
              {orden.asistencialNombre?.toUpperCase() || emptyDash}
            </div>
            {orden.asistencialEspecialidad && (
              <div className="hci-print-signature-meta">{orden.asistencialEspecialidad}</div>
            )}
            <div className="hci-print-signature-meta">
              Tarjeta profesional N° {orden.asistencialTarjetaProfesional || emptyDash}
            </div>
          </div>
        </div>
      ),
    })

    list.push({
      kind: "block",
      id: "pie-orden",
      node: (
        <div className="hci-print-footer">
          Documento generado el {generatedLabel || emptyDash}
        </div>
      ),
    })

    return list
  }, [orden, generatedLabel])

  const { pages, measuringPass } = usePaginatedUnits(units, headerBlock)

  return (
    <>
      {measuringPass}
      <PaginatedPages pages={pages} headerBlock={headerBlock} />
    </>
  )
}
