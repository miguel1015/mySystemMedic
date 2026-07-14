"use client"

import { Descriptions, Typography } from "antd"

export interface NotaEnfermeriaViewData {
  fechaNota: string | null
  horaNota: string | null
  nombreProfesional?: string
  nota: string
}

interface Props {
  data: NotaEnfermeriaViewData
  professionalIsReference?: boolean
}

export const NotaEnfermeriaDetailView = ({ data, professionalIsReference }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Fecha">{data.fechaNota || "Se asigna al guardar"}</Descriptions.Item>
      <Descriptions.Item label="Hora">{data.horaNota?.slice(0, 5) || "Se asigna al guardar"}</Descriptions.Item>
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
      <Typography.Text strong>Nota de enfermería</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.nota || "—"}</p>
    </div>
  </div>
)
