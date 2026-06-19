"use client"

import { Button, Input, Typography } from "antd"

const { TextArea } = Input

export const AnalysisTab = () => (
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
      defaultValue="Paciente con trauma cerrado de tórax y abdomen posterior a accidente de tránsito, con contusión torácica y dolor abdominal secundario. Hemodinámicamente estable, sin compromiso neurológico."
    />
  </div>
)
