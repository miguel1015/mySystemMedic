"use client"

import { AuditOutlined, CloseCircleOutlined, EyeOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useState } from "react"
import { useCreateProcedimientoNoQx, useUpdateProcedimientoNoQx } from "@/core/hooks/care/procedimientosNoQx/useSaveProcedimientoNoQx"
import { useMe } from "@/core/hooks/users/useMeUser"
import type { GetUser } from "@/core/interfaces/user/users"
import { labelStyle } from "../constants"
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

export const NonSurgicalSection = ({
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
  const [consulta, setConsulta] = useState("")

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTitle, setPreviewTitle] = useState("Vista previa del procedimiento no quirúrgico")
  const [previewFecha, setPreviewFecha] = useState("")
  const [previewHora, setPreviewHora] = useState("")
  const [previewDoctor, setPreviewDoctor] = useState("")
  const [previewDescripcion, setPreviewDescripcion] = useState("")

  const createProcedimientoNoQx = useCreateProcedimientoNoQx()
  const updateProcedimientoNoQx = useUpdateProcedimientoNoQx()
  const isSaving = createProcedimientoNoQx.isPending || updateProcedimientoNoQx.isPending

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

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Procedimiento no quirúrgico (edición)" : "Vista previa del procedimiento no quirúrgico")
    setPreviewFecha(fechaProcedimiento)
    setPreviewHora(horaProcedimiento)
    setPreviewDoctor(me?.name || "")
    setPreviewDescripcion(consulta)
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevos procedimientos no quirúrgicos.")
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
      messageApi.error("No se encontró la admisión asociada a este procedimiento.")
      return
    }

    try {
      const saved = editingId
        ? await updateProcedimientoNoQx.mutateAsync({
            id: editingId,
            data: { fechaProcedimiento, horaProcedimiento, descripcion, isActive: true },
          })
        : await createProcedimientoNoQx.mutateAsync({
            admissionId: Number(admissionId),
            fechaProcedimiento,
            horaProcedimiento,
            descripcion,
          })

      messageApi.success(
        editingId
          ? "Procedimiento no quirúrgico actualizado correctamente"
          : `Procedimiento no quirúrgico guardado para ${patientName}.`,
      )
      setPreviewTitle("Procedimiento no quirúrgico guardado")
      setPreviewFecha(saved.fechaProcedimiento)
      setPreviewHora(saved.horaProcedimiento)
      setPreviewDoctor(saved.nombreProfesional)
      setPreviewDescripcion(saved.descripcion)
      setPreviewOpen(true)
      reset()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento no quirúrgico.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <AuditOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Procedimiento No Quirúrgico #${editingId}` : "Nuevo Procedimiento No Quirúrgico"}
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
          Esta historia clínica ya fue clausurada y no admite más procedimientos no quirúrgicos.
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
          <span className="section-title">Procedimiento no quirúrgico</span>
        </div>
        <label style={labelStyle}>Procedimiento no quirúrgico <span className="field-required">*</span></label>
        <TextArea
          rows={14}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Describa el procedimiento no quirúrgico, evaluación, justificación, técnica utilizada e indicaciones de seguimiento..."
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
          {editingId ? "Actualizar procedimiento no quirúrgico" : "Guardar procedimiento no quirúrgico"}
        </Button>
      </div>

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
            documentTitle="Procedimiento No Quirúrgico"
            attentionLabel="Fecha y hora del procedimiento:"
            attentionDate={previewFecha}
            attentionTime={previewHora?.slice(0, 5)}
            doctorName={previewDoctor}
            doctorUser={doctorUser}
            sections={[
              {
                title: "Procedimiento no quirúrgico",
                rows: [{ label: "Procedimiento no quirúrgico", value: previewDescripcion }],
              },
            ]}
          />
        )}
      />
    </div>
  )
}
