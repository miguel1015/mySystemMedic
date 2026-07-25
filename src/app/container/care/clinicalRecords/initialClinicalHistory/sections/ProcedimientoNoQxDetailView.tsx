"use client"

import { Descriptions, Typography } from "antd"

export interface ProcedimientoNoQxViewData {
  fechaProcedimiento: string
  horaProcedimiento: string
  nombreProfesional?: string
  descripcion: string
}

interface Props {
  data: ProcedimientoNoQxViewData
  professionalIsReference?: boolean
}

export const ProcedimientoNoQxDetailView = ({ data, professionalIsReference }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Fecha">{data.fechaProcedimiento || "—"}</Descriptions.Item>
      <Descriptions.Item label="Hora">{data.horaProcedimiento?.slice(0, 5) || "—"}</Descriptions.Item>
      <Descriptions.Item label="Profesional" span={2}>
        {data.nombreProfesional || "Se asigna automáticamente al guardar"}
        {professionalIsReference && data.nombreProfesional && (
          <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            (referencial, se confirma al guardar)
          </Typography.Text>
        )}
      </Descriptions.Item>
    </Descriptions>

    <div>
      <Typography.Text strong>Procedimiento no quirúrgico</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.descripcion || "—"}</p>
    </div>
  </div>
)
