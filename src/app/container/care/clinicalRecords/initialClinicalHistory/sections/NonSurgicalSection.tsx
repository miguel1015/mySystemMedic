"use client"

import { AuditOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import { useCreateProcedimientoNoQx } from "@/core/hooks/care/procedimientosNoQx/useSaveProcedimientoNoQx"
import { labelStyle } from "../constants"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const NonSurgicalSection = ({ admissionId, currentDoctor, patientName, messageApi }: Props) => {
  const [consulta, setConsulta] = useState("")
  const createProcedimientoNoQx = useCreateProcedimientoNoQx()

  const validateAndSave = async () => {
    if (!consulta.trim()) { messageApi.error("El campo es obligatorio."); return }
    if (!admissionId) { messageApi.error("No se encontró la admisión asociada a este procedimiento."); return }

    try {
      await createProcedimientoNoQx.mutateAsync({
        admissionId: Number(admissionId),
        descripcion: consulta.trim(),
      })
      messageApi.success(`Procedimiento no quirúrgico guardado para ${patientName}.`)
      setConsulta("")
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento no quirúrgico.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <AuditOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nuevo Procedimiento No Quirúrgico</Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <label style={labelStyle}>Procedimiento no quirúrgico <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describa el procedimiento no quirúrgico, evaluación, justificación, técnica utilizada e indicaciones de seguimiento..."
          maxLength={10000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={() => setConsulta("")}>Limpiar formulario</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={createProcedimientoNoQx.isPending}
          onClick={validateAndSave}
        >
          Guardar procedimiento no quirúrgico
        </Button>
      </div>
    </div>
  )
}
