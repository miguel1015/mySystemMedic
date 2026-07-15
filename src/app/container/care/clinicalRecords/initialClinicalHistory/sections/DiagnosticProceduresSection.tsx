"use client"

import { CloseCircleOutlined, ExperimentOutlined, EyeOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateProcedimientoDiagnostico } from "@/core/hooks/care/procedimientosDiagnosticos/useCreateProcedimientoDiagnostico"
import { useUpdateProcedimientoDiagnostico } from "@/core/hooks/care/procedimientosDiagnosticos/useUpdateProcedimientoDiagnostico"
import { useMe } from "@/core/hooks/users/useMeUser"
import type { ProcedimientoDiagnosticoResponse } from "@/core/interfaces/care/hciInicial"
import type { GetUser } from "@/core/interfaces/user/users"
import { labelStyle } from "../constants"
import { ProcedimientosDiagnosticosRecentModal } from "./ProcedimientosDiagnosticosRecentModal"
import ClinicalPrintPreviewModal from "../printPreview/ClinicalPrintPreviewModal"
import { GenericClinicalPrintDocument } from "../printPreview/GenericClinicalPrintDocument"
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

export const DiagnosticProceduresSection = ({
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
  const { data: me } = useMe()

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
  const [fechaProcedimiento, setFechaProcedimiento] = useState(todayDate)
  const [horaProcedimiento, setHoraProcedimiento] = useState(nowTime)
  const [estudios, setEstudios] = useState("")
  const [hallazgos, setHallazgos] = useState("")
  const [recentOpen, setRecentOpen] = useState(false)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState("Vista previa del procedimiento diagnóstico")
  const [previewFecha, setPreviewFecha] = useState("")
  const [previewHora, setPreviewHora] = useState("")
  const [previewDoctor, setPreviewDoctor] = useState("")
  const [previewEstudios, setPreviewEstudios] = useState("")
  const [previewHallazgos, setPreviewHallazgos] = useState("")

  const createProcedimientoDiagnostico = useCreateProcedimientoDiagnostico()
  const updateProcedimientoDiagnostico = useUpdateProcedimientoDiagnostico()
  const isSaving = createProcedimientoDiagnostico.isPending || updateProcedimientoDiagnostico.isPending

  const reset = () => {
    setEditingId(null)
    setFechaProcedimiento(todayDate())
    setHoraProcedimiento(nowTime())
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
    setFechaProcedimiento(procedimientoDiagnostico.fechaProcedimiento)
    setHoraProcedimiento(procedimientoDiagnostico.horaProcedimiento)
    setEstudios(procedimientoDiagnostico.estudiosRealizados)
    setHallazgos(procedimientoDiagnostico.hallazgos)
    setRecentOpen(false)
  }

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Procedimiento diagnóstico (edición)" : "Vista previa del procedimiento diagnóstico")
    setPreviewFecha(fechaProcedimiento)
    setPreviewHora(horaProcedimiento)
    setPreviewDoctor(me?.name || "")
    setPreviewEstudios(estudios)
    setPreviewHallazgos(hallazgos)
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevos procedimientos diagnósticos.")
      return
    }

    const estudiosRealizados = estudios.trim()
    const hallazgosValue = hallazgos.trim()

    if (!fechaProcedimiento) {
      messageApi.error("La fecha del procedimiento es obligatoria.")
      return
    }
    if (!horaProcedimiento) {
      messageApi.error("La hora del procedimiento es obligatoria.")
      return
    }
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
            data: { fechaProcedimiento, horaProcedimiento, estudiosRealizados, hallazgos: hallazgosValue, isActive: true },
          })
        : await createProcedimientoDiagnostico.mutateAsync({
            admissionId: Number(admissionId),
            fechaProcedimiento,
            horaProcedimiento,
            estudiosRealizados,
            hallazgos: hallazgosValue,
          })

      messageApi.success(
        editingId
          ? "Procedimiento diagnóstico actualizado correctamente"
          : `Procedimiento diagnóstico guardado para ${patientName}.`,
      )
      setPreviewTitle("Procedimiento diagnóstico guardado")
      setPreviewFecha(saved.fechaProcedimiento)
      setPreviewHora(saved.horaProcedimiento)
      setPreviewDoctor(saved.nombreProfesional)
      setPreviewEstudios(saved.estudiosRealizados)
      setPreviewHallazgos(saved.hallazgos)
      setPreviewOpen(true)
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
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      {historyClosed && (
        <div className="qx-section-locked-banner">
          Esta historia clínica ya fue clausurada y no admite más procedimientos diagnósticos.
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
          <span className="section-number">3</span>
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

      <ClinicalPrintPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        renderDocument={(provider) => (
          <GenericClinicalPrintDocument
            provider={provider}
            patient={resolvedPatient}
            admissionDate={admissionDate}
            contractName={contractName}
            documentTitle="Procedimiento Diagnóstico"
            attentionLabel="Fecha y hora del procedimiento:"
            attentionDate={previewFecha}
            attentionTime={previewHora?.slice(0, 5)}
            doctorName={previewDoctor}
            doctorUser={doctorUser}
            sections={[
              {
                title: "Estudios realizados",
                rows: [{ label: "Estudios realizados", value: previewEstudios }],
              },
              {
                title: "Hallazgos",
                rows: [{ label: "Hallazgos", value: previewHallazgos }],
              },
            ]}
          />
        )}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="diagnostic-procedures"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
