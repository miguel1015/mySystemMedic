"use client"

import { Descriptions, Typography } from "antd"

export interface NotaEgresoViewData {
  vitals: {
    ta: string
    fc: number
    fr: number
    temperature: number
    saturation: number
    weight: number
    height: number
  }
  bmi: string
  condicionesGenerales: string
  cabezaCuello: string
  torax: string
  abdomen: string
  extremidades: string
  sistemaNervioso: string
  genitourinario: string
  evolucionesTxt: string
  justificacion: string
  ordenes: string
  ambitoEgreso?: string
  fechaEgreso: string
  diag1?: string
  diag2?: string
  diag3?: string
  finalidadConsulta?: string
  causaExterna?: string
  condicionSalida?: string
  diagnosticoMuerte: string
  fechaMuerte: string
}

interface Props {
  data: NotaEgresoViewData
}

export const NotaEgresoDetailView = ({ data }: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Descriptions title="Signos vitales" column={3} size="small" bordered>
      <Descriptions.Item label="TA">{data.vitals.ta || "—"}</Descriptions.Item>
      <Descriptions.Item label="FC (lpm)">{data.vitals.fc ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="FR (rpm)">{data.vitals.fr ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Temp. (°C)">{data.vitals.temperature ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Sat. O₂ (%)">{data.vitals.saturation ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Peso (kg)">{data.vitals.weight ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Talla (cm)">{data.vitals.height ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="IMC">{data.bmi ? `${data.bmi} kg/m²` : "—"}</Descriptions.Item>
    </Descriptions>

    {[
      { label: "Condiciones generales de salida", value: data.condicionesGenerales },
      { label: "Cabeza y cuello", value: data.cabezaCuello },
      { label: "Tórax", value: data.torax },
      { label: "Abdomen", value: data.abdomen },
      { label: "Extremidades", value: data.extremidades },
      { label: "Sistema nervioso", value: data.sistemaNervioso },
      { label: "Genitourinario", value: data.genitourinario },
      { label: "Evoluciones", value: data.evolucionesTxt },
      { label: "Justificación de hospitalización", value: data.justificacion },
      { label: "Órdenes", value: data.ordenes },
    ].map(({ label, value }) => (
      <div key={label}>
        <Typography.Text strong>{label}</Typography.Text>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{value || "—"}</p>
      </div>
    ))}

    <Descriptions title="Diagnósticos de egreso" column={2} size="small" bordered>
      <Descriptions.Item label="Ámbito de egreso">{data.ambitoEgreso || "—"}</Descriptions.Item>
      <Descriptions.Item label="Fecha de egreso">{data.fechaEgreso || "—"}</Descriptions.Item>
      <Descriptions.Item label="Diagnóstico 1">{data.diag1 || "—"}</Descriptions.Item>
      <Descriptions.Item label="Diagnóstico 2">{data.diag2 || "—"}</Descriptions.Item>
      <Descriptions.Item label="Diagnóstico 3">{data.diag3 || "—"}</Descriptions.Item>
      <Descriptions.Item label="Finalidad de consulta">{data.finalidadConsulta || "—"}</Descriptions.Item>
      <Descriptions.Item label="Causa externa">{data.causaExterna || "—"}</Descriptions.Item>
      <Descriptions.Item label="Condición de salida">{data.condicionSalida || "—"}</Descriptions.Item>
    </Descriptions>

    {data.condicionSalida === "Fallecido" && (
      <Descriptions title="Datos de fallecimiento" column={1} size="small" bordered>
        <Descriptions.Item label="Diagnóstico de muerte">{data.diagnosticoMuerte || "—"}</Descriptions.Item>
        <Descriptions.Item label="Fecha de muerte">{data.fechaMuerte || "—"}</Descriptions.Item>
      </Descriptions>
    )}
  </div>
)
