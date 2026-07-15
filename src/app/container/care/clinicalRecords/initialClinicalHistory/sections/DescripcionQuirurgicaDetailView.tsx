"use client"

import { Descriptions, Tag, Typography } from "antd"
import type { QxSearchItem } from "../types"

export interface DescripcionQuirurgicaViewData {
  fechaInicio: string
  fechaFin: string
  cirujano?: string
  anestesiologo?: string
  instrumentador?: string
  ayudante?: string
  tipoAnestesia?: string
  procedimientos: QxSearchItem[]
  diagnosticos: QxSearchItem[]
  descripcion: string
}

interface Props {
  data: DescripcionQuirurgicaViewData
}

const renderItems = (items: QxSearchItem[], mainLabel: string, extraLabel: string) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {items.map((item, idx) => (
      <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <Tag color={idx === 0 ? "blue" : "default"}>{idx === 0 ? mainLabel : `${extraLabel} ${idx + 1}`}</Tag>
        <span>{item.code ? `${item.code} - ${item.description || "—"}` : "—"}</span>
      </div>
    ))}
  </div>
)

export const DescripcionQuirurgicaDetailView = ({ data }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Fecha inicial de ejecución">{data.fechaInicio || "—"}</Descriptions.Item>
      <Descriptions.Item label="Fecha final de ejecución">{data.fechaFin || "—"}</Descriptions.Item>
    </Descriptions>

    <Descriptions title="Equipo quirúrgico" column={2} size="small" bordered>
      <Descriptions.Item label="Cirujano">{data.cirujano || "—"}</Descriptions.Item>
      <Descriptions.Item label="Anestesiólogo">{data.anestesiologo || "—"}</Descriptions.Item>
      <Descriptions.Item label="Instrumentador">{data.instrumentador || "—"}</Descriptions.Item>
      <Descriptions.Item label="Ayudante Qx">{data.ayudante || "—"}</Descriptions.Item>
      <Descriptions.Item label="Tipo de anestesia" span={2}>{data.tipoAnestesia || "—"}</Descriptions.Item>
    </Descriptions>

    <div>
      <Typography.Text strong>Procedimientos (CUPS/SOAT)</Typography.Text>
      <div style={{ marginTop: 6 }}>{renderItems(data.procedimientos, "Principal", "Procedimiento")}</div>
    </div>

    <div>
      <Typography.Text strong>Diagnósticos de ingreso (CIE-10)</Typography.Text>
      <div style={{ marginTop: 6 }}>{renderItems(data.diagnosticos, "Principal", "Diagnóstico")}</div>
    </div>

    <div>
      <Typography.Text strong>Descripción del procedimiento</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.descripcion || "—"}</p>
    </div>
  </div>
)
