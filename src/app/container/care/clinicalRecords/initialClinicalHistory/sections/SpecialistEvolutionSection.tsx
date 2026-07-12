"use client"

import { CloseCircleOutlined, EyeOutlined, SaveOutlined, SolutionOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useCreateEvolucionEspecialista"
import { useUpdateEvolucionEspecialista } from "@/core/hooks/care/evolucionEspecialista/useUpdateEvolucionEspecialista"
import { useMe } from "@/core/hooks/users/useMeUser"
import type { EvolucionEspecialistaResponse } from "@/core/interfaces/care/hciInicial"
import { labelStyle } from "../constants"
import { EvolucionesEspecialistaRecentModal } from "./EvolucionesEspecialistaRecentModal"
import { EvolucionEspecialistaPreviewModal } from "./EvolucionEspecialistaPreviewModal"
import type { EvolucionEspecialistaViewData } from "./EvolucionEspecialistaDetailView"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

const MAX_LENGTH = 1000

export const SpecialistEvolutionSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const { data: me } = useMe()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [motivoConsulta, setMotivoConsulta] = useState("")
  const [plan, setPlan] = useState("")

  const [recentOpen, setRecentOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<EvolucionEspecialistaViewData | null>(null)
  const [previewTitle, setPreviewTitle] = useState("Vista previa de la evolución")
  const [previewIsReference, setPreviewIsReference] = useState(false)

  const createEvolucionEspecialista = useCreateEvolucionEspecialista()
  const updateEvolucionEspecialista = useUpdateEvolucionEspecialista()
  const isSaving = createEvolucionEspecialista.isPending || updateEvolucionEspecialista.isPending

  const reset = () => {
    setEditingId(null)
    setMotivoConsulta("")
    setPlan("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (evolucion: EvolucionEspecialistaResponse) => {
    setEditingId(evolucion.id)
    setMotivoConsulta(evolucion.motivoConsulta)
    setPlan(evolucion.plan)
    setRecentOpen(false)
  }

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Evolución de especialista (edición)" : "Vista previa de la evolución")
    setPreviewIsReference(true)
    setPreviewData({
      fechaEvolucion: null,
      horaEvolucion: null,
      nombreProfesional: me?.name,
      motivoConsulta,
      plan,
    })
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas evoluciones de especialista.")
      return
    }

    const motivo = motivoConsulta.trim()
    const planTrimmed = plan.trim()

    if (!motivo) {
      messageApi.error("El motivo de consulta es obligatorio.")
      return
    }
    if (motivo.length > MAX_LENGTH) {
      messageApi.error("El motivo de consulta no puede superar los 1000 caracteres.")
      return
    }
    if (!planTrimmed) {
      messageApi.error("El campo Plan es obligatorio.")
      return
    }
    if (planTrimmed.length > MAX_LENGTH) {
      messageApi.error("El campo Plan no puede superar los 1000 caracteres.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta evolución.")
      return
    }

    try {
      let saved: EvolucionEspecialistaResponse
      if (editingId) {
        saved = await updateEvolucionEspecialista.mutateAsync({
          id: editingId,
          data: { motivoConsulta: motivo, plan: planTrimmed, isActive: true },
        })
        messageApi.success("Evolución de especialista actualizada correctamente")
      } else {
        saved = await createEvolucionEspecialista.mutateAsync({
          admissionId: Number(admissionId),
          motivoConsulta: motivo,
          plan: planTrimmed,
        })
        messageApi.success(`Evolución de especialista guardada para ${patientName}.`)
      }

      setEditingId(saved.id)
      setPreviewTitle("Evolución de especialista guardada")
      setPreviewIsReference(false)
      setPreviewData({
        fechaEvolucion: saved.fechaEvolucion,
        horaEvolucion: saved.horaEvolucion,
        nombreProfesional: saved.nombreProfesional,
        motivoConsulta: saved.motivoConsulta,
        plan: saved.plan,
      })
      setPreviewOpen(true)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la evolución de especialista.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <SolutionOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Evolución de Especialista #${editingId}` : "Nueva Evolución de Especialista"}
        </Typography.Title>
        <div className="evo-header-meta">
          <span>{currentDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más evoluciones de especialista.
        </div>
      )}

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">1</span>
          <span className="section-title">Motivo de consulta</span>
        </div>
        <label style={labelStyle}>
          Motivo de consulta <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={motivoConsulta}
          onChange={(e) => setMotivoConsulta(e.target.value)}
          placeholder="Registre los hallazgos de la consulta del especialista, evaluación y diagnóstico especializado..."
          maxLength={MAX_LENGTH}
          showCount
          disabled={historyClosed}
        />
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
          <span className="section-title">Plan</span>
        </div>
        <label style={labelStyle}>
          Plan <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="Registre el plan de manejo del especialista: tratamiento, indicaciones y seguimiento especializado..."
          maxLength={MAX_LENGTH}
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
          {editingId ? "Actualizar evolución de especialista" : "Guardar evolución de especialista"}
        </Button>
      </div>

      <EvolucionesEspecialistaRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <EvolucionEspecialistaPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title={previewTitle}
        professionalIsReference={previewIsReference}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="specialist-evolution"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
