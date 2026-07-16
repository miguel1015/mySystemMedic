"use client"

import { CloseCircleOutlined, EyeOutlined, FormOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateNotaMedica } from "@/core/hooks/care/notasMedicas/useCreateNotaMedica"
import { useUpdateNotaMedica } from "@/core/hooks/care/notasMedicas/useUpdateNotaMedica"
import type { NotaMedicaResponse } from "@/core/interfaces/care/hciInicial"
import type { GetUser } from "@/core/interfaces/user/users"
import { labelStyle } from "../constants"
import { NotasMedicasRecentModal } from "./NotasMedicasRecentModal"
import NotaMedicaPrintPreviewModal from "../printPreview/NotaMedicaPrintPreviewModal"
import type { PrintPatient } from "../printPreview/printDocument.utils"

interface Props {
  admissionId?: string | number
  currentDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
  patient?: PrintPatient
  admissionDate?: string
  contractName?: string
  doctorUser?: GetUser
}

const { TextArea } = Input

const todayDate = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 8)

export const MedicalNotesSection = ({
  admissionId,
  currentDoctor,
  patientName,
  messageApi,
  historyClosed,
  patient,
  admissionDate = "",
  contractName = "",
  doctorUser,
}: Props) => {
  const resolvedPatient: PrintPatient = patient ?? {
    name: patientName,
    documentType: "",
    documentNumber: "",
    careScope: "",
    birthDate: "",
    sex: "",
    insurer: "",
  }
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fechaNota, setFechaNota] = useState(todayDate)
  const [horaNota, setHoraNota] = useState(nowTime)
  const [consulta, setConsulta] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState("Vista previa de la nota médica")
  const [previewFecha, setPreviewFecha] = useState("")
  const [previewHora, setPreviewHora] = useState("")
  const [previewNota, setPreviewNota] = useState("")
  const [previewDoctor, setPreviewDoctor] = useState("")

  const createNotaMedica = useCreateNotaMedica()
  const updateNotaMedica = useUpdateNotaMedica()
  const isSaving = createNotaMedica.isPending || updateNotaMedica.isPending

  const reset = () => {
    setEditingId(null)
    setFechaNota(todayDate())
    setHoraNota(nowTime())
    setConsulta("")
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (notaMedica: NotaMedicaResponse) => {
    setEditingId(notaMedica.id)
    setFechaNota(notaMedica.fechaNota)
    setHoraNota(notaMedica.horaNota)
    setConsulta(notaMedica.nota)
    setRecentOpen(false)
  }

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Nota médica (edición)" : "Vista previa de la nota médica")
    setPreviewFecha(fechaNota)
    setPreviewHora(horaNota)
    setPreviewNota(consulta)
    setPreviewDoctor(currentDoctor)
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas notas médicas.")
      return
    }

    const nota = consulta.trim()

    if (!fechaNota) {
      messageApi.error("La fecha de la nota es obligatoria.")
      return
    }
    if (!horaNota) {
      messageApi.error("La hora de la nota es obligatoria.")
      return
    }
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
            data: { fechaNota, horaNota, nota, isActive: true },
          })
        : await createNotaMedica.mutateAsync({
            admissionId: Number(admissionId),
            fechaNota,
            horaNota,
            nota,
          })

      messageApi.success(
        editingId ? "Nota médica actualizada correctamente" : `Nota médica guardada para ${patientName}.`,
      )
      setEditingId(saved.id)
      setPreviewTitle("Nota médica guardada")
      setPreviewFecha(saved.fechaNota)
      setPreviewHora(saved.horaNota)
      setPreviewNota(saved.nota)
      setPreviewDoctor(saved.nombreProfesional)
      setPreviewOpen(true)
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
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más notas médicas.
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
          <span className="section-title">Nota Médica</span>
        </div>
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

      <NotaMedicaPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        patient={resolvedPatient}
        admissionDate={admissionDate}
        contractName={contractName}
        fechaNota={previewFecha}
        horaNota={previewHora}
        doctorName={previewDoctor}
        doctorUser={doctorUser}
        nota={previewNota}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="medical-note"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
