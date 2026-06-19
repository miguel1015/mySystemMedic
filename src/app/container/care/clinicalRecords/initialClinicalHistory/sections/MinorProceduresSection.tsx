"use client"

import { SaveOutlined, ToolOutlined } from "@ant-design/icons"
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

export const MinorProceduresSection = ({ currentDoctor, patientName, messageApi }: Props) => {
  const [consulta, setConsulta] = useState("")

  const validateAndSave = () => {
    if (!consulta.trim()) { messageApi.error("El campo es obligatorio."); return }
    messageApi.success(`Procedimiento menor guardado para ${patientName}.`)
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <ToolOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nuevo Procedimiento Menor</Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <label style={labelStyle}>Procedimiento menor <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describa el procedimiento menor, motivo, evaluación, técnica utilizada e indicaciones post-procedimiento..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={() => setConsulta("")}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
          Guardar procedimiento menor
        </Button>
      </div>
    </div>
  )
}
