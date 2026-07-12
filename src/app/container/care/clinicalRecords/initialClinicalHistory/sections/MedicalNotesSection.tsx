"use client"

import { CloseCircleOutlined, FormOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateNotaMedica } from "@/core/hooks/care/notasMedicas/useCreateNotaMedica"
import { useUpdateNotaMedica } from "@/core/hooks/care/notasMedicas/useUpdateNotaMedica"
import type { NotaMedicaResponse } from "@/core/interfaces/care/hciInicial"
import { labelStyle } from "../constants"
import { NotasMedicasRecentModal } from "./NotasMedicasRecentModal"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

export const MedicalNotesSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [consulta, setConsulta] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)

  const createNotaMedica = useCreateNotaMedica()
  const updateNotaMedica = useUpdateNotaMedica()
  const isSaving = createNotaMedica.isPending || updateNotaMedica.isPending

  const reset = () => {
    setEditingId(null)
    setConsulta("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (notaMedica: NotaMedicaResponse) => {
    setEditingId(notaMedica.id)
    setConsulta(notaMedica.nota)
    setRecentOpen(false)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas notas médicas.")
      return
    }

    const nota = consulta.trim()

    if (!nota) {
      messageApi.error("El campo es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta nota médica.")
      return
    }

    try {
      const saved = editingId
        ? await updateNotaMedica.mutateAsync({
            id: editingId,
            data: { nota, isActive: true },
          })
        : await createNotaMedica.mutateAsync({
            admissionId: Number(admissionId),
            nota,
          })

      messageApi.success(
        editingId ? "Nota médica actualizada correctamente" : `Nota médica guardada para ${patientName}.`,
      )
      setEditingId(saved.id)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la nota médica.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <FormOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Nota Médica #${editingId}` : "Nueva Nota Médica"}
        </Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más notas médicas.
        </div>
      )}

      <div className="qx-section">
        <label style={labelStyle}>Nota médica <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Registre los hallazgos de la consulta médica, anamnesis, evaluación clínica e indicaciones del paciente..."
          maxLength={5000}
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
          {editingId ? "Actualizar nota médica" : "Guardar nota médica"}
        </Button>
      </div>

      <NotasMedicasRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="medical-note"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
