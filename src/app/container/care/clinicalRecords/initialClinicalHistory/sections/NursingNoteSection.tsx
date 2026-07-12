"use client"

import { CloseCircleOutlined, FormOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import { useCreateNotaEnfermeria, useUpdateNotaEnfermeria } from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import { labelStyle } from "../constants"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

export const NursingNoteSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nota, setNota] = useState("")

  const createNotaEnfermeria = useCreateNotaEnfermeria()
  const updateNotaEnfermeria = useUpdateNotaEnfermeria()
  const isSaving = createNotaEnfermeria.isPending || updateNotaEnfermeria.isPending

  const reset = () => {
    setEditingId(null)
    setNota("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas notas de enfermería.")
      return
    }

    const notaValue = nota.trim()

    if (!notaValue) {
      messageApi.error("La nota de enfermería es obligatoria.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta nota.")
      return
    }

    try {
      const saved = editingId
        ? await updateNotaEnfermeria.mutateAsync({
            id: editingId,
            data: { nota: notaValue, isActive: true },
          })
        : await createNotaEnfermeria.mutateAsync({
            admissionId: Number(admissionId),
            nota: notaValue,
          })

      messageApi.success(
        editingId ? "Nota de enfermería actualizada correctamente" : `Nota de enfermería guardada para ${patientName}.`,
      )
      setEditingId(saved.id)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la nota de enfermería.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <FormOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Nota de Enfermería #${editingId}` : "Nueva Nota de Enfermería"}
        </Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más notas de enfermería.
        </div>
      )}

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
          {editingId ? "Actualizar nota de enfermería" : "Guardar nota de enfermería"}
        </Button>
      </div>
    </div>
  )
}
