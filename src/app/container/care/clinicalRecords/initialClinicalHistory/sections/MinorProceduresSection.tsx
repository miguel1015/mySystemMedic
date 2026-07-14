"use client"

import { CloseCircleOutlined, EyeOutlined, SaveOutlined, ToolOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateProcedimientoMenor } from "@/core/hooks/care/procedimientosMenores/useCreateProcedimientoMenor"
import { useUpdateProcedimientoMenor } from "@/core/hooks/care/procedimientosMenores/useUpdateProcedimientoMenor"
import { useMe } from "@/core/hooks/users/useMeUser"
import type { ProcedimientoMenorResponse } from "@/core/interfaces/care/hciInicial"
import { labelStyle } from "../constants"
import { ProcedimientosMenoresRecentModal } from "./ProcedimientosMenoresRecentModal"
import { ProcedimientoMenorPreviewModal } from "./ProcedimientoMenorPreviewModal"
import type { ProcedimientoMenorViewData } from "./ProcedimientoMenorDetailView"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

const todayDate = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 8)

export const MinorProceduresSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const { data: me } = useMe()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [fechaProcedimiento, setFechaProcedimiento] = useState(todayDate)
  const [horaProcedimiento, setHoraProcedimiento] = useState(nowTime)
  const [consulta, setConsulta] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<ProcedimientoMenorViewData | null>(null)
  const [previewTitle, setPreviewTitle] = useState("Vista previa del procedimiento menor")
  const [previewIsReference, setPreviewIsReference] = useState(false)

  const createProcedimientoMenor = useCreateProcedimientoMenor()
  const updateProcedimientoMenor = useUpdateProcedimientoMenor()
  const isSaving = createProcedimientoMenor.isPending || updateProcedimientoMenor.isPending

  const reset = () => {
    setEditingId(null)
    setFechaProcedimiento(todayDate())
    setHoraProcedimiento(nowTime())
    setConsulta("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (procedimientoMenor: ProcedimientoMenorResponse) => {
    setEditingId(procedimientoMenor.id)
    setFechaProcedimiento(procedimientoMenor.fechaProcedimiento)
    setHoraProcedimiento(procedimientoMenor.horaProcedimiento)
    setConsulta(procedimientoMenor.descripcion)
    setRecentOpen(false)
  }

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Procedimiento menor (edición)" : "Vista previa del procedimiento menor")
    setPreviewIsReference(true)
    setPreviewData({
      fechaProcedimiento,
      horaProcedimiento,
      nombreProfesional: me?.name,
      descripcion: consulta,
    })
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevos procedimientos menores.")
      return
    }

    const descripcion = consulta.trim()

    if (!fechaProcedimiento) {
      messageApi.error("La fecha del procedimiento es obligatoria.")
      return
    }
    if (!horaProcedimiento) {
      messageApi.error("La hora del procedimiento es obligatoria.")
      return
    }
    if (!descripcion) {
      messageApi.error("El campo es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a este procedimiento menor.")
      return
    }

    try {
      const saved = editingId
        ? await updateProcedimientoMenor.mutateAsync({
            id: editingId,
            data: { fechaProcedimiento, horaProcedimiento, descripcion, isActive: true },
          })
        : await createProcedimientoMenor.mutateAsync({
            admissionId: Number(admissionId),
            fechaProcedimiento,
            horaProcedimiento,
            descripcion,
          })

      messageApi.success(
        editingId ? "Procedimiento menor actualizado correctamente" : `Procedimiento menor guardado para ${patientName}.`,
      )
      setPreviewTitle("Procedimiento menor guardado")
      setPreviewIsReference(false)
      setPreviewData({
        fechaProcedimiento: saved.fechaProcedimiento,
        horaProcedimiento: saved.horaProcedimiento,
        nombreProfesional: saved.nombreProfesional,
        descripcion: saved.descripcion,
      })
      setPreviewOpen(true)
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
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más procedimientos menores.
        </div>
      )}

      <div className="qx-section">
        <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="section-number">1</span>
          <span className="section-title">Fecha y hora del procedimiento</span>
        </div>
        <div className="evo-vitals-grid">
          <div className="evo-vital-item">
            <label style={labelStyle}>
              Fecha <span className="field-required">*</span>
            </label>
            <Input
              type="date"
              value={fechaProcedimiento}
              onChange={(e) => setFechaProcedimiento(e.target.value)}
              disabled={historyClosed}
            />
          </div>
          <div className="evo-vital-item">
            <label style={labelStyle}>
              Hora <span className="field-required">*</span>
            </label>
            <Input
              type="time"
              step={1}
              value={horaProcedimiento}
              onChange={(e) => setHoraProcedimiento(e.target.value)}
              disabled={historyClosed}
            />
          </div>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
          <span className="section-title">Procedimiento menor</span>
        </div>
        <label style={labelStyle}>Procedimiento menor <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describa el procedimiento menor, motivo, evaluación, técnica utilizada e indicaciones post-procedimiento..."
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

      <ProcedimientoMenorPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title={previewTitle}
        professionalIsReference={previewIsReference}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="minor-procedures"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
