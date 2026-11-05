"use client"

import { formatCurrency } from "@/app/container/billing/admissionIntegral/utils"
import type { BillingMovementResponse } from "@/core/interfaces/care/billing"
import { Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table"
import { RipsServiceGroupKey, RipsServicios, classifyMovement } from "./buildRips"

// Filas y columnas de la tabla de servicios de la vista RIPS.

const monoStyle: React.CSSProperties = { fontFamily: "monospace" }

// Muestra el valor tal como iría en el JSON; si falta, lo marca para que se vea qué
// dato hay que completar en MediNexus.
export function CodeCell({ value, hint }: { value: string | number | null | undefined; hint?: string }) {
  if (value === null || value === undefined || value === "") {
    return (
      <Tooltip title={hint ?? "Dato pendiente para el RIPS"}>
        <Tag color="orange" style={{ marginInlineEnd: 0 }}>
          Sin código
        </Tag>
      </Tooltip>
    )
  }
  return <span style={monoStyle}>{value}</span>
}


export interface ServiceRow {
  key: string
  consecutivo: number
  codigo: string | null
  descripcion: string
  diagnostico: string | null
  profesional: string | null
  cantidad: number | null
  vrUnitario: number | null
  vrServicio: number | null
  extra: string | null
}

export const GROUP_LABELS: Record<RipsServiceGroupKey, string> = {
  consultas: "Consultas",
  procedimientos: "Procedimientos",
  urgencias: "Urgencias",
  hospitalizacion: "Hospitalización",
  recienNacidos: "Recién nacidos",
  medicamentos: "Medicamentos",
  otrosServicios: "Otros servicios",
}

export const GROUP_ORDER: RipsServiceGroupKey[] = [
  "consultas",
  "procedimientos",
  "medicamentos",
  "otrosServicios",
  "urgencias",
  "hospitalizacion",
  "recienNacidos",
]

export function buildServiceRows(
  servicios: RipsServicios,
  movements: BillingMovementResponse[],
): Record<RipsServiceGroupKey, ServiceRow[]> {
  // Los nombres no viajan en el JSON de consultas, procedimientos y medicamentos; se toman
  // de los cargos en el mismo orden en que buildRips los recorrió.
  const namesByGroup: Record<RipsServiceGroupKey, string[]> = {
    consultas: [],
    procedimientos: [],
    urgencias: [],
    hospitalizacion: [],
    recienNacidos: [],
    medicamentos: [],
    otrosServicios: [],
  }
  for (const movement of movements.filter((item) => item.isActive !== false)) {
    namesByGroup[classifyMovement(movement)].push(movement.name)
  }

  return {
    consultas: servicios.consultas.map((item, index) => ({
      key: `c-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codConsulta,
      descripcion: namesByGroup.consultas[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: 1,
      vrUnitario: item.vrServicio,
      vrServicio: item.vrServicio,
      extra: item.fechaInicioAtencion,
    })),
    procedimientos: servicios.procedimientos.map((item, index) => ({
      key: `p-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codProcedimiento,
      descripcion: namesByGroup.procedimientos[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: 1,
      vrUnitario: item.vrServicio,
      vrServicio: item.vrServicio,
      extra: item.fechaInicioAtencion,
    })),
    medicamentos: servicios.medicamentos.map((item, index) => ({
      key: `m-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codTecnologiaSalud,
      descripcion: namesByGroup.medicamentos[index] ?? "-",
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: item.numDocumentoIdentificacion,
      cantidad: item.cantidadMedicamento,
      vrUnitario: item.vrUnitMedicamento,
      vrServicio: item.vrServicio,
      extra: item.fechaDispensAdmon,
    })),
    otrosServicios: servicios.otrosServicios.map((item) => ({
      key: `o-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codTecnologiaSalud,
      descripcion: item.nomTecnologiaSalud ?? "-",
      diagnostico: null,
      profesional: item.numDocumentoIdentificacion,
      cantidad: item.cantidadOS,
      vrUnitario: item.vrUnitOS,
      vrServicio: item.vrServicio,
      extra: item.tipoOS,
    })),
    urgencias: servicios.urgencias.map((item) => ({
      key: `u-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codDiagnosticoPrincipalE,
      descripcion: `Ingreso ${item.fechaInicioAtencion ?? "-"} · Egreso ${item.fechaEgreso ?? "-"}`,
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: null,
      cantidad: null,
      vrUnitario: null,
      vrServicio: null,
      extra: item.condicionDestinoUsuarioEgreso,
    })),
    hospitalizacion: servicios.hospitalizacion.map((item) => ({
      key: `h-${item.consecutivo}`,
      consecutivo: item.consecutivo,
      codigo: item.codDiagnosticoPrincipalE,
      descripcion: `Ingreso ${item.fechaInicioAtencion ?? "-"} · Egreso ${item.fechaEgreso ?? "-"}`,
      diagnostico: item.codDiagnosticoPrincipal,
      profesional: null,
      cantidad: null,
      vrUnitario: null,
      vrServicio: null,
      extra: item.condicionDestinoUsuarioEgreso,
    })),
    recienNacidos: [],
  }
}

export function columnsFor(group: RipsServiceGroupKey): ColumnsType<ServiceRow> {
  const isEpisode = group === "urgencias" || group === "hospitalizacion"

  if (isEpisode) {
    return [
      { title: "#", dataIndex: "consecutivo", width: 50 },
      { title: "Periodo", dataIndex: "descripcion" },
      {
        title: "Dx ingreso",
        dataIndex: "diagnostico",
        width: 110,
        render: (value) => <CodeCell value={value} />,
      },
      {
        title: "Dx egreso",
        dataIndex: "codigo",
        width: 110,
        render: (value) => <CodeCell value={value} hint="No hay egreso registrado" />,
      },
      {
        title: "Condición egreso",
        dataIndex: "extra",
        width: 140,
        render: (value) => <CodeCell value={value} />,
      },
    ]
  }

  const codeTitle =
    group === "medicamentos" ? "CUM" : group === "otrosServicios" ? "Código" : "CUPS"

  const columns: ColumnsType<ServiceRow> = [
    { title: "#", dataIndex: "consecutivo", width: 50 },
    {
      title: codeTitle,
      dataIndex: "codigo",
      width: 120,
      render: (value) => <CodeCell value={value} />,
    },
    { title: "Descripción", dataIndex: "descripcion", ellipsis: true },
  ]

  if (group === "otrosServicios") {
    columns.push({
      title: "Tipo OS",
      dataIndex: "extra",
      width: 90,
      render: (value) => <CodeCell value={value} />,
    })
  } else {
    columns.push({
      title: "Dx principal",
      dataIndex: "diagnostico",
      width: 110,
      render: (value) => <CodeCell value={value} />,
    })
  }

  columns.push(
    {
      title: "Profesional",
      dataIndex: "profesional",
      width: 120,
      render: (value) => <CodeCell value={value} hint="No se identificó el profesional" />,
    },
    { title: "Cant.", dataIndex: "cantidad", width: 60, align: "right" },
    {
      title: "Valor",
      dataIndex: "vrServicio",
      width: 120,
      align: "right",
      render: (value: number | null) => formatCurrency(value),
    },
  )

  return columns
}
