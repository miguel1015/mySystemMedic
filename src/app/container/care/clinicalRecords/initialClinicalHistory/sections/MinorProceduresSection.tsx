"use client"

import { CloseCircleOutlined, SaveOutlined, ToolOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateProcedimientoMenor } from "@/core/hooks/care/procedimientosMenores/useCreateProcedimientoMenor"
import { useUpdateProcedimientoMenor } from "@/core/hooks/care/procedimientosMenores/useUpdateProcedimientoMenor"
import type { ProcedimientoMenorResponse } from "@/core/interfaces/care/hciInicial"
import { labelStyle } from "../constants"
import { ProcedimientosMenoresRecentModal } from "./ProcedimientosMenoresRecentModal"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const MinorProceduresSection = ({ admissionId, currentDoctor, patientName, messageApi }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [consulta, setConsulta] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)

  const createProcedimientoMenor = useCreateProcedimientoMenor()
  const updateProcedimientoMenor = useUpdateProcedimientoMenor()
  const isSaving = createProcedimientoMenor.isPending || updateProcedimientoMenor.isPending

  const reset = () => {
    setEditingId(null)
    setConsulta("")
  }

  const loadForEdit = (procedimientoMenor: ProcedimientoMenorResponse) => {
    setEditingId(procedimientoMenor.id)
    setConsulta(procedimientoMenor.descripcion)
    setRecentOpen(false)
  }

  const validateAndSave = async () => {
    const descripcion = consulta.trim()

    if (!descripcion) {
      messageApi.error("El campo es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a este procedimiento menor.")
      return
    }

    try {
      if (editingId) {
        await updateProcedimientoMenor.mutateAsync({
          id: editingId,
          data: { descripcion, isActive: true },
        })
        messageApi.success("Procedimiento menor actualizado correctamente")
      } else {
        await createProcedimientoMenor.mutateAsync({
          admissionId: Number(admissionId),
          descripcion,
        })
        messageApi.success(`Procedimiento menor guardado para ${patientName}.`)
      }
      reset()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento menor.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <ToolOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Procedimiento Menor #${editingId}` : "Nuevo Procedimiento Menor"}
        </Typography.Title>
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
          maxLength={5000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        {editingId && (
          <Button icon={<CloseCircleOutlined />} onClick={reset}>
            Cancelar edición
          </Button>
        )}
        <Button onClick={reset}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} loading={isSaving} onClick={validateAndSave}>
          {editingId ? "Actualizar procedimiento menor" : "Guardar procedimiento menor"}
        </Button>
      </div>

      <ProcedimientosMenoresRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="minor-procedures"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
