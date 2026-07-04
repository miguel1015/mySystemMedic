"use client"

import { Button, Input, Typography } from "antd"

const { TextArea } = Input

interface Props {
  value: string
  onChange: (value: string) => void
}

export const AnalysisTab = ({ value, onChange }: Props) => (
  <div className="tab-section-inner">
    <Typography.Title level={5} style={{ marginTop: 0 }}>3. Análisis</Typography.Title>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <Button size="small">B</Button>
      <Button size="small">I</Button>
      <Button size="small">Lista</Button>
      <Button size="small">Plantilla</Button>
    </div>
    <TextArea
      rows={8}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={1000}
    />
  </div>
)
