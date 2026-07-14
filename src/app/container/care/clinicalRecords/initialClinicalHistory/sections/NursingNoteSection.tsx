"use client"

import { CloseCircleOutlined, EyeOutlined, FormOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import { useCreateNotaEnfermeria, useUpdateNotaEnfermeria } from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import { useMe } from "@/core/hooks/users/useMeUser"
import { labelStyle } from "../constants"
import { NotaEnfermeriaPreviewModal } from "./NotaEnfermeriaPreviewModal"
import type { NotaEnfermeriaViewData } from "./NotaEnfermeriaDetailView"

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

export const NursingNoteSection = ({ admissionId, currentDoctor, patientName, messageApi, historyClosed }: Props) => {
  const { data: me } = useMe()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [fechaNota, setFechaNota] = useState(todayDate)
  const [horaNota, setHoraNota] = useState(nowTime)
  const [nota, setNota] = useState("")

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<NotaEnfermeriaViewData | null>(null)
  const [previewTitle, setPreviewTitle] = useState("Vista previa de la nota de enfermería")
  const [previewIsReference, setPreviewIsReference] = useState(false)

  const createNotaEnfermeria = useCreateNotaEnfermeria()
  const updateNotaEnfermeria = useUpdateNotaEnfermeria()
  const isSaving = createNotaEnfermeria.isPending || updateNotaEnfermeria.isPending

  const reset = () => {
    setEditingId(null)
    setFechaNota(todayDate())
    setHoraNota(nowTime())
    setNota("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Nota de enfermería (edición)" : "Vista previa de la nota de enfermería")
    setPreviewIsReference(true)
    setPreviewData({
      fechaNota,
      horaNota,
      nombreProfesional: me?.name,
      nota,
    })
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas notas de enfermería.")
      return
    }

    const notaValue = nota.trim()

    if (!fechaNota) {
      messageApi.error("La fecha de la nota es obligatoria.")
      return
    }
    if (!horaNota) {
      messageApi.error("La hora de la nota es obligatoria.")
      return
    }
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
            data: { fechaNota, horaNota, nota: notaValue, isActive: true },
          })
        : await createNotaEnfermeria.mutateAsync({
            admissionId: Number(admissionId),
            fechaNota,
            horaNota,
            nota: notaValue,
          })

      messageApi.success(
        editingId ? "Nota de enfermería actualizada correctamente" : `Nota de enfermería guardada para ${patientName}.`,
      )
      setPreviewTitle("Nota de enfermería guardada")
      setPreviewIsReference(false)
      setPreviewData({
        fechaNota: saved.fechaNota,
        horaNota: saved.horaNota,
        nombreProfesional: saved.nombreProfesional,
        nota: saved.nota,
      })
      setPreviewOpen(true)
      reset()
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
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más notas de enfermería.
        </div>
      )}

      <div className="qx-section">
        <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="section-number">1</span>
          <span className="section-title">Fecha y hora de la nota</span>
        </div>
        <div className="evo-vitals-grid">
          <div className="evo-vital-item">
            <label style={labelStyle}>
              Fecha <span className="field-required">*</span>
            </label>
            <Input
              type="date"
              value={fechaNota}
              onChange={(e) => setFechaNota(e.target.value)}
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
              value={horaNota}
              onChange={(e) => setHoraNota(e.target.value)}
              disabled={historyClosed}
            />
          </div>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
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

      <NotaEnfermeriaPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title={previewTitle}
        professionalIsReference={previewIsReference}
      />
    </div>
  )
}
