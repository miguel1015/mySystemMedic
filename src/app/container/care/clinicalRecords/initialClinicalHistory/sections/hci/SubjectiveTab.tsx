"use client"

import { Input, Typography } from "antd"
import { labelStyle } from "../../constants"

const { TextArea } = Input

export const SubjectiveTab = () => (
  <div className="tab-section-inner">
    <Typography.Title level={5} style={{ marginTop: 0 }}>1. Subjetivo (SOAP)</Typography.Title>
    <div className="subjective-grid">
      <div>
        <label style={labelStyle}>Motivo de consulta</label>
        <Input defaultValue="Me accidenté" />
      </div>
      <div>
        <label style={labelStyle}>Revisión por sistemas</label>
        <Input defaultValue="Lo referido en enfermedad actual" />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Enfermedad actual</label>
        <TextArea
          rows={4}
          defaultValue="Paciente masculino de 21 años de edad, víctima de accidente de tránsito el día de ayer. Refiere dolor torácico y abdominal posterior al evento."
        />
      </div>
    </div>
  </div>
)
