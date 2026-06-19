"use client"

import { SaveOutlined, SolutionOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import { labelStyle } from "../constants"

interface Props {
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const SpecialistEvolutionSection = ({ currentDoctor, patientName, messageApi }: Props) => {
  const [consulta, setConsulta] = useState("")
  const [plan, setPlan] = useState("")

  const reset = () => {
    setConsulta("")
    setPlan("")
  }

  const validateAndSave = () => {
    if (!consulta.trim()) { messageApi.error("El campo Consulta es obligatorio."); return }
    if (!plan.trim()) { messageApi.error("El campo Plan es obligatorio."); return }
    messageApi.success(`Evolución de especialista guardada para ${patientName}.`)
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <SolutionOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nueva Evolución de Especialista</Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">1</span>
          <span className="section-title">Consulta</span>
        </div>
        <label style={labelStyle}>Consulta <span className="field-required">*</span></label>
        <TextArea
          rows={8}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Registre los hallazgos de la consulta del especialista, evaluación y diagnóstico especializado..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
          <span className="section-title">Plan</span>
        </div>
        <label style={labelStyle}>Plan <span className="field-required">*</span></label>
        <TextArea
          rows={8}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="Registre el plan de manejo del especialista: tratamiento, indicaciones y seguimiento especializado..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={reset}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
          Guardar evolución de especialista
        </Button>
      </div>
    </div>
  )
}
