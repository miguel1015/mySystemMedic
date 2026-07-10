"use client"

import { Descriptions, Typography } from "antd"

export interface EvolucionViewData {
  fechaEvolucion: string
  horaEvolucion: string
  nombreProfesional?: string
  motivoConsulta: string
  tensionArterial: string | null
  frecuenciaCardiaca: number | null
  frecuenciaRespiratoria: number | null
  temperatura: number | null
  saturacionOxigeno: number | null
  glasgow: number | null
  peso: number | null
  talla: number | null
  imc?: number | null
  plan: string
}

interface Props {
  data: EvolucionViewData
  professionalIsReference?: boolean
}

export const EvolucionDetailView = ({ data, professionalIsReference }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions column={2} size="small" bordered>
      <Descriptions.Item label="Fecha">{data.fechaEvolucion || "—"}</Descriptions.Item>
      <Descriptions.Item label="Hora">{data.horaEvolucion?.slice(0, 5) || "—"}</Descriptions.Item>
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

    <Descriptions title="Signos vitales" column={3} size="small" bordered>
      <Descriptions.Item label="TA">{data.tensionArterial || "—"}</Descriptions.Item>
      <Descriptions.Item label="FC (lpm)">{data.frecuenciaCardiaca ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="FR (rpm)">{data.frecuenciaRespiratoria ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Temp. (°C)">{data.temperatura ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Sat. O₂ (%)">{data.saturacionOxigeno ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Glasgow">{data.glasgow ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Peso (kg)">{data.peso ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Talla (m)">{data.talla ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="IMC">
        {data.imc != null ? `${data.imc} kg/m²` : "Se calcula al guardar"}
      </Descriptions.Item>
    </Descriptions>

    <div>
      <Typography.Text strong>Plan</Typography.Text>
      <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{data.plan || "—"}</p>
    </div>
  </div>
)
