"use client"

import { Input, Typography } from "antd"
import { labelStyle } from "../../constants"
import type { SubjectiveState } from "../../types"

const { TextArea } = Input

interface Props {
  value: SubjectiveState
  onChange: (value: SubjectiveState) => void
  disabled?: boolean
  admissionDate: string
  admissionTime: string
  onAdmissionDateChange: (value: string) => void
  onAdmissionTimeChange: (value: string) => void
}

export const SubjectiveTab = ({
  value,
  onChange,
  disabled,
  admissionDate,
  admissionTime,
  onAdmissionDateChange,
  onAdmissionTimeChange,
}: Props) => (
  <div className="tab-section-inner">
    <Typography.Title level={5} style={{ marginTop: 0 }}>1. Subjetivo (SOAP)</Typography.Title>
    <div className="subjective-grid">
      <div>
        <label style={labelStyle}>Fecha de atención <span className="field-required">*</span></label>
        <Input
          type="date"
          value={admissionDate}
          onChange={(e) => onAdmissionDateChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div>
        <label style={labelStyle}>Hora de atención <span className="field-required">*</span></label>
        <Input
          type="time"
          step={1}
          value={admissionTime}
          onChange={(e) => onAdmissionTimeChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div>
        <label style={labelStyle}>Motivo de consulta <span className="field-required">*</span></label>
        <Input
          value={value.motivoConsulta}
          onChange={(e) => onChange({ ...value, motivoConsulta: e.target.value })}
          maxLength={300}
          disabled={disabled}
        />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Enfermedad actual <span className="field-required">*</span></label>
        <TextArea
          rows={4}
          value={value.enfermedadActual}
          onChange={(e) => onChange({ ...value, enfermedadActual: e.target.value })}
          maxLength={1000}
          disabled={disabled}
        />
      </div>
    </div>
  </div>
)
