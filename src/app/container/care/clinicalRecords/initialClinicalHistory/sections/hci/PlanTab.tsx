"use client"

import { Button, Input, Typography } from "antd"

const { TextArea } = Input

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const PlanTab = ({ value, onChange, disabled }: Props) => (
  <div className="tab-section-inner">
    <Typography.Title level={5} style={{ marginTop: 0 }}>5. Plan <span className="field-required">*</span></Typography.Title>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <Button size="small" disabled={disabled}>B</Button>
      <Button size="small" disabled={disabled}>I</Button>
      <Button size="small" disabled={disabled}>Lista</Button>
      <Button size="small" disabled={disabled}>Plantilla</Button>
    </div>
    <TextArea
      rows={8}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={1000}
      placeholder="Describa el plan de manejo terapéutico, indicaciones, medicamentos y seguimiento..."
      disabled={disabled}
    />
  </div>
)
