"use client"

import { FormOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import { useCreateNotaEnfermeria } from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import { labelStyle } from "../constants"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const NursingNoteSection = ({ admissionId, currentDoctor, patientName, messageApi }: Props) => {
  const [nota, setNota] = useState("")
  const createNotaEnfermeria = useCreateNotaEnfermeria()

  const validateAndSave = async () => {
    if (!nota.trim()) {
      messageApi.error("La nota de enfermería es obligatoria.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta nota.")
      return
    }

    try {
      await createNotaEnfermeria.mutateAsync({
        admissionId: Number(admissionId),
        nota: nota.trim(),
      })
      messageApi.success(`Nota de enfermería guardada para ${patientName}.`)
      setNota("")
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la nota de enfermería.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <FormOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nueva Nota de Enfermería</Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">1</span>
          <span className="section-title">Nota de Enfermería</span>
        </div>
        <label style={labelStyle}>
          Nota de enfermería <span className="field-required">*</span>
        </label>
        <TextArea
          rows={16}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Registre las observaciones, actividades realizadas, novedades y seguimiento clínico del paciente durante su atención de enfermería..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={() => setNota("")}>Limpiar formulario</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={createNotaEnfermeria.isPending}
          onClick={validateAndSave}
        >
          Guardar nota de enfermería
        </Button>
      </div>
    </div>
  )
}
