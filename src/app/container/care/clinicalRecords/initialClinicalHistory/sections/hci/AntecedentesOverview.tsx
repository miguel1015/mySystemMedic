"use client"

import { Empty, Typography } from "antd"
import type { HCInicialResponse } from "@/core/interfaces/care/hciInicial"
import { antecedentesFields } from "../../constants"

interface Props {
  hcInicial: HCInicialResponse
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

interface FieldProps {
  label: string
  value?: string | null
}

const Field = ({ label, value }: FieldProps) => (
  <div className="chrm-detail-field">
    <span className="chrm-detail-field-label">{label}</span>
    <p className="chrm-detail-field-value">{value ? value : "—"}</p>
  </div>
)

export const AntecedentesOverview = ({ hcInicial }: Props) => {
  const { objetivo } = hcInicial

  return (
    <div className="chrm-hci-overview">
      <div className="chrm-hci-meta">
        <span>{hcInicial.nombrePaciente} · {hcInicial.documentoPaciente}</span>
        <span>Fecha de atención: {hcInicial.admissionDate}</span>
        <span>Hora de admisión: {hcInicial.admissionTime || "—"}</span>
        <span>Última actualización: {formatDateTime(hcInicial.updatedAt)}</span>
      </div>

      {objetivo ? (
        <div className="chrm-hci-grid">
          {antecedentesFields.map(({ key, label }) => (
            <Field key={key} label={label} value={objetivo[key]} />
          ))}
        </div>
      ) : (
        <Empty description="Aún no se han registrado antecedentes para esta admisión." />
      )}

      {objetivo && antecedentesFields.every(({ key }) => !objetivo[key]?.trim()) && (
        <Typography.Text type="secondary">
          Los antecedentes de esta admisión están vacíos.
        </Typography.Text>
      )}
    </div>
  )
}
