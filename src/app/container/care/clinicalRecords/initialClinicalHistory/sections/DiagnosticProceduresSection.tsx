"use client"

import { CloseCircleOutlined, ExperimentOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateProcedimientoDiagnostico } from "@/core/hooks/care/procedimientosDiagnosticos/useCreateProcedimientoDiagnostico"
import { useUpdateProcedimientoDiagnostico } from "@/core/hooks/care/procedimientosDiagnosticos/useUpdateProcedimientoDiagnostico"
import type { ProcedimientoDiagnosticoResponse } from "@/core/interfaces/care/hciInicial"
import { labelStyle } from "../constants"
import { ProcedimientosDiagnosticosRecentModal } from "./ProcedimientosDiagnosticosRecentModal"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

export const DiagnosticProceduresSection = ({ admissionId, currentDoctor, patientName, messageApi }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [estudios, setEstudios] = useState("")
  const [hallazgos, setHallazgos] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)

  const createProcedimientoDiagnostico = useCreateProcedimientoDiagnostico()
  const updateProcedimientoDiagnostico = useUpdateProcedimientoDiagnostico()
  const isSaving = createProcedimientoDiagnostico.isPending || updateProcedimientoDiagnostico.isPending

  const reset = () => {
    setEditingId(null)
    setEstudios("")
    setHallazgos("")
  }

  const loadForEdit = (procedimientoDiagnostico: ProcedimientoDiagnosticoResponse) => {
    setEditingId(procedimientoDiagnostico.id)
    setEstudios(procedimientoDiagnostico.estudiosRealizados)
    setHallazgos(procedimientoDiagnostico.hallazgos)
    setRecentOpen(false)
  }

  const validateAndSave = async () => {
    const estudiosRealizados = estudios.trim()
    const hallazgosValue = hallazgos.trim()

    if (!estudiosRealizados) {
      messageApi.error("El campo Estudios realizados es obligatorio.")
      return
    }
    if (!hallazgosValue) {
      messageApi.error("El campo Hallazgos es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a este procedimiento diagnóstico.")
      return
    }

    try {
      if (editingId) {
        await updateProcedimientoDiagnostico.mutateAsync({
          id: editingId,
          data: { estudiosRealizados, hallazgos: hallazgosValue, isActive: true },
        })
        messageApi.success("Procedimiento diagnóstico actualizado correctamente")
      } else {
        await createProcedimientoDiagnostico.mutateAsync({
          admissionId: Number(admissionId),
          estudiosRealizados,
          hallazgos: hallazgosValue,
        })
        messageApi.success(`Procedimiento diagnóstico guardado para ${patientName}.`)
      }
      reset()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento diagnóstico.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <ExperimentOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Procedimiento Diagnóstico #${editingId}` : "Nuevo Procedimiento Diagnóstico"}
        </Typography.Title>
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
          maxLength={2000}
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
          maxLength={2000}
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
          {editingId ? "Actualizar procedimiento diagnóstico" : "Guardar procedimiento diagnóstico"}
        </Button>
      </div>

      <ProcedimientosDiagnosticosRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="diagnostic-procedures"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
