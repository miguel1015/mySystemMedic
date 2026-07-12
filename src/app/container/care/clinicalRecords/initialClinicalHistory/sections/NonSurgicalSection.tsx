"use client"

import { AuditOutlined, CloseCircleOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import { useCreateProcedimientoNoQx, useUpdateProcedimientoNoQx } from "@/core/hooks/care/procedimientosNoQx/useSaveProcedimientoNoQx"
import { labelStyle } from "../constants"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

export const NonSurgicalSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [consulta, setConsulta] = useState("")

  const createProcedimientoNoQx = useCreateProcedimientoNoQx()
  const updateProcedimientoNoQx = useUpdateProcedimientoNoQx()
  const isSaving = createProcedimientoNoQx.isPending || updateProcedimientoNoQx.isPending

  const reset = () => {
    setEditingId(null)
    setConsulta("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevos procedimientos no quirúrgicos.")
      return
    }

    const descripcion = consulta.trim()

    if (!descripcion) {
      messageApi.error("El campo es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a este procedimiento.")
      return
    }

    try {
      const saved = editingId
        ? await updateProcedimientoNoQx.mutateAsync({
            id: editingId,
            data: { descripcion, isActive: true },
          })
        : await createProcedimientoNoQx.mutateAsync({
            admissionId: Number(admissionId),
            descripcion,
          })

      messageApi.success(
        editingId
          ? "Procedimiento no quirúrgico actualizado correctamente"
          : `Procedimiento no quirúrgico guardado para ${patientName}.`,
      )
      setEditingId(saved.id)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento no quirúrgico.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <AuditOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Procedimiento No Quirúrgico #${editingId}` : "Nuevo Procedimiento No Quirúrgico"}
        </Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más procedimientos no quirúrgicos.
        </div>
      )}

      <div className="qx-section">
        <label style={labelStyle}>Procedimiento no quirúrgico <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describa el procedimiento no quirúrgico, evaluación, justificación, técnica utilizada e indicaciones de seguimiento..."
          maxLength={10000}
          showCount
          disabled={historyClosed}
        />
      </div>

      <div className="clinical-history-footer-actions">
        {editingId && (
          <Button icon={<CloseCircleOutlined />} onClick={reset} disabled={historyClosed}>
            Cancelar edición
          </Button>
        )}
        <Button onClick={reset} disabled={historyClosed}>Limpiar formulario</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={validateAndSave}
          disabled={historyClosed}
        >
          {editingId ? "Actualizar procedimiento no quirúrgico" : "Guardar procedimiento no quirúrgico"}
        </Button>
      </div>
    </div>
  )
}
