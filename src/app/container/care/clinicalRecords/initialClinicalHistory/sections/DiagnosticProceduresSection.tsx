"use client"

import { ExperimentOutlined, SaveOutlined } from "@ant-design/icons"
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

export const DiagnosticProceduresSection = ({ currentDoctor, patientName, messageApi }: Props) => {
  const [estudios, setEstudios] = useState("")
  const [hallazgos, setHallazgos] = useState("")

  const reset = () => {
    setEstudios("")
    setHallazgos("")
  }

  const validateAndSave = () => {
    if (!estudios.trim()) {
      messageApi.error("El campo Estudios realizados es obligatorio.")
      return
    }
    if (!hallazgos.trim()) {
      messageApi.error("El campo Hallazgos es obligatorio.")
      return
    }
    messageApi.success(`Procedimiento diagnóstico guardado para ${patientName}.`)
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <ExperimentOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nuevo Procedimiento Diagnóstico</Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">1</span>
          <span className="section-title">Estudios realizados</span>
        </div>
        <label style={labelStyle}>
          Estudios realizados <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={estudios}
          onChange={(e) => setEstudios(e.target.value)}
          placeholder="Describa los estudios diagnósticos realizados al paciente (laboratorios, imágenes, electrocardiograma, etc.)..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
          <span className="section-title">Hallazgos</span>
        </div>
        <label style={labelStyle}>
          Hallazgos <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={hallazgos}
          onChange={(e) => setHallazgos(e.target.value)}
          placeholder="Registre los hallazgos obtenidos en los estudios diagnósticos realizados..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={reset}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
          Guardar procedimiento diagnóstico
        </Button>
      </div>
    </div>
  )
}
