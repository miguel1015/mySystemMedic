"use client"

import { Button, Input, Typography } from "antd"

const { TextArea } = Input

export const PlanTab = () => (
  <div className="tab-section-inner">
    <Typography.Title level={5} style={{ marginTop: 0 }}>5. Plan</Typography.Title>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <Button size="small">B</Button>
      <Button size="small">I</Button>
      <Button size="small">Lista</Button>
      <Button size="small">Plantilla</Button>
    </div>
    <TextArea
      rows={8}
      placeholder="Describa el plan de manejo terapéutico, indicaciones, medicamentos y seguimiento..."
    />
  </div>
)
