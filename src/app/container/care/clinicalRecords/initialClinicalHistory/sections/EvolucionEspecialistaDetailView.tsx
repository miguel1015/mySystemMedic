"use client"

import { Descriptions, Typography } from "antd"

export interface EvolucionEspecialistaViewData {
  fechaEvolucion: string | null
  horaEvolucion: string | null
  nombreProfesional?: string
  motivoConsulta: string
  plan: string
}

interface Props {
  data: EvolucionEspecialistaViewData
  professionalIsReference?: boolean
}

export const EvolucionEspecialistaDetailView = ({ data, professionalIsReference }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Fecha">{data.fechaEvolucion || "Se asigna al guardar"}</Descriptions.Item>
      <Descriptions.Item label="Hora">{data.horaEvolucion?.slice(0, 5) || "Se asigna al guardar"}</Descriptions.Item>
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
      <Typography.Text strong>Motivo de consulta</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.motivoConsulta || "—"}</p>
    </div>

    <div>
      <Typography.Text strong>Plan</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.plan || "—"}</p>
    </div>
  </div>
)
