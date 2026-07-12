"use client"

import { CloseCircleOutlined, ExperimentOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
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
  historyClosed?: boolean
}

const { TextArea } = Input

export const DiagnosticProceduresSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
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

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (procedimientoDiagnostico: ProcedimientoDiagnosticoResponse) => {
    setEditingId(procedimientoDiagnostico.id)
    setEstudios(procedimientoDiagnostico.estudiosRealizados)
    setHallazgos(procedimientoDiagnostico.hallazgos)
    setRecentOpen(false)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevos procedimientos diagnósticos.")
      return
    }

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
      const saved = editingId
        ? await updateProcedimientoDiagnostico.mutateAsync({
            id: editingId,
            data: { estudiosRealizados, hallazgos: hallazgosValue, isActive: true },
          })
        : await createProcedimientoDiagnostico.mutateAsync({
            admissionId: Number(admissionId),
            estudiosRealizados,
            hallazgos: hallazgosValue,
          })

      messageApi.success(
        editingId
          ? "Procedimiento diagnóstico actualizado correctamente"
          : `Procedimiento diagnóstico guardado para ${patientName}.`,
      )
      setEditingId(saved.id)
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

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más procedimientos diagnósticos.
        </div>
      )}

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
          disabled={historyClosed}
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
