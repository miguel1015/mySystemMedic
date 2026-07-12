"use client"

import { CloseCircleOutlined, EyeOutlined, HeartOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, InputNumber, Tag, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useEffect, useMemo, useState } from "react"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { useCreateEvolucion } from "@/core/hooks/care/evoluciones/useCreateEvolucion"
import { useUpdateEvolucion } from "@/core/hooks/care/evoluciones/useUpdateEvolucion"
import { useMe } from "@/core/hooks/users/useMeUser"
import type { EvolucionResponse } from "@/core/interfaces/care/hciInicial"
import { defaultEvoVitals, labelStyle } from "../constants"
import type { EvoVitalsState } from "../types"
import { EvolucionesRecentModal } from "./EvolucionesRecentModal"
import { EvolucionPreviewModal } from "./EvolucionPreviewModal"
import type { EvolucionViewData } from "./EvolucionDetailView"

interface Props {
  admissionId?: string | number
  selectedDoctor: string
  patientName: string
  messageApi: MessageInstance
  historyClosed?: boolean
}

const { TextArea } = Input

const vitalsConfig: Array<{ label: string; key: keyof EvoVitalsState; isString?: boolean; placeholder: string }> = [
  { label: "TA (mmHg)", key: "ta", isString: true, placeholder: "120/80" },
  { label: "FC (lpm)", key: "fc", placeholder: "80" },
  { label: "FR (rpm)", key: "fr", placeholder: "18" },
  { label: "Temperatura (°C)", key: "temperature", placeholder: "36.5" },
  { label: "Sat. O₂ (%)", key: "saturation", placeholder: "98" },
  { label: "Glasgow", key: "glasgow", placeholder: "15" },
  { label: "Peso (kg)", key: "weight", placeholder: "80" },
  { label: "Talla (cm)", key: "height", placeholder: "175" },
]

const todayDate = () => new Date().toISOString().slice(0, 10)
const nowTime = () => new Date().toTimeString().slice(0, 8)

export const EvolutionSection = ({ admissionId, selectedDoctor, patientName, messageApi, historyClosed }: Props) => {
  const { data: me } = useMe()

  const [editingId, setEditingId] = useState<number | null>(null)
  const [fechaEvolucion, setFechaEvolucion] = useState(todayDate)
  const [horaEvolucion, setHoraEvolucion] = useState(nowTime)
  const [evoMotivo, setEvoMotivo] = useState("")
  const [evoPlan, setEvoPlan] = useState("")
  const [evoVitals, setEvoVitals] = useState<EvoVitalsState>({ ...defaultEvoVitals })
  const [savedImc, setSavedImc] = useState<number | null>(null)

  const [recentOpen, setRecentOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<EvolucionViewData | null>(null)
  const [previewTitle, setPreviewTitle] = useState("Vista previa de la evolución")
  const [previewIsReference, setPreviewIsReference] = useState(false)

  const createEvolucion = useCreateEvolucion()
  const updateEvolucion = useUpdateEvolucion()
  const isSaving = createEvolucion.isPending || updateEvolucion.isPending

  const evoBmi = useMemo(() => {
    const h = evoVitals.height / 100
    if (!h || !evoVitals.weight) return ""
    return (evoVitals.weight / (h * h)).toFixed(1)
  }, [evoVitals.height, evoVitals.weight])

  const reset = () => {
    setEditingId(null)
    setFechaEvolucion(todayDate())
    setHoraEvolucion(nowTime())
    setEvoMotivo("")
    setEvoPlan("")
    setEvoVitals({ ...defaultEvoVitals })
    setSavedImc(null)
  }

  useEffect(() => {
    if (!historyClosed) return
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyClosed])

  const loadForEdit = (evolucion: EvolucionResponse) => {
    setEditingId(evolucion.id)
    setFechaEvolucion(evolucion.fechaEvolucion)
    setHoraEvolucion(evolucion.horaEvolucion)
    setEvoMotivo(evolucion.motivoConsulta)
    setEvoPlan(evolucion.plan)
    setEvoVitals({
      ta: evolucion.tensionArterial || "",
      fc: evolucion.frecuenciaCardiaca || 0,
      fr: evolucion.frecuenciaRespiratoria || 0,
      temperature: evolucion.temperatura || 0,
      saturation: evolucion.saturacionOxigeno || 0,
      glasgow: evolucion.glasgow || 0,
      weight: evolucion.peso || 0,
      height: evolucion.talla ? evolucion.talla * 100 : 0,
    })
    setSavedImc(evolucion.imc ?? null)
    setRecentOpen(false)
  }

  const buildViewData = (imc: number | null, nombreProfesional?: string): EvolucionViewData => ({
    fechaEvolucion,
    horaEvolucion,
    nombreProfesional,
    motivoConsulta: evoMotivo,
    tensionArterial: evoVitals.ta || null,
    frecuenciaCardiaca: evoVitals.fc || null,
    frecuenciaRespiratoria: evoVitals.fr || null,
    temperatura: evoVitals.temperature || null,
    saturacionOxigeno: evoVitals.saturation || null,
    glasgow: evoVitals.glasgow || null,
    peso: evoVitals.weight || null,
    talla: evoVitals.height ? evoVitals.height / 100 : null,
    imc,
    plan: evoPlan,
  })

  const openPreview = () => {
    setPreviewTitle(editingId ? "Vista previa - Evolución (edición)" : "Vista previa de la evolución")
    setPreviewIsReference(true)
    setPreviewData(buildViewData(evoBmi ? Number(evoBmi) : savedImc, me?.name))
    setPreviewOpen(true)
  }

  const validateAndSave = async () => {
    if (historyClosed) {
      messageApi.error("La historia clínica inicial está clausurada; no se pueden registrar nuevas evoluciones.")
      return
    }

    const motivo = evoMotivo.trim()
    const plan = evoPlan.trim()

    if (!fechaEvolucion) {
      messageApi.error("La fecha de evolución es obligatoria.")
      return
    }
    if (!horaEvolucion) {
      messageApi.error("La hora de evolución es obligatoria.")
      return
    }
    if (!motivo) {
      messageApi.error("El motivo de consulta es obligatorio.")
      return
    }
    if (!plan) {
      messageApi.error("El campo Plan es obligatorio.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta evolución.")
      return
    }

    const basePayload = {
      fechaEvolucion,
      horaEvolucion,
      motivoConsulta: motivo,
      tensionArterial: evoVitals.ta || null,
      frecuenciaCardiaca: evoVitals.fc || null,
      frecuenciaRespiratoria: evoVitals.fr || null,
      temperatura: evoVitals.temperature || null,
      saturacionOxigeno: evoVitals.saturation || null,
      glasgow: evoVitals.glasgow || null,
      peso: evoVitals.weight || null,
      talla: evoVitals.height ? evoVitals.height / 100 : null,
      plan,
    }

    try {
      let saved: EvolucionResponse
      if (editingId) {
        saved = await updateEvolucion.mutateAsync({
          id: editingId,
          data: { ...basePayload, isActive: true },
        })
        messageApi.success("Evolución actualizada correctamente")
      } else {
        saved = await createEvolucion.mutateAsync({
          admissionId: Number(admissionId),
          ...basePayload,
        })
        messageApi.success("Evolución guardada correctamente")
      }

      setEditingId(saved.id)
      setPreviewTitle("Evolución guardada")
      setPreviewIsReference(false)
      setPreviewData({
        fechaEvolucion: saved.fechaEvolucion,
        horaEvolucion: saved.horaEvolucion,
        nombreProfesional: saved.nombreProfesional,
        motivoConsulta: saved.motivoConsulta,
        tensionArterial: saved.tensionArterial,
        frecuenciaCardiaca: saved.frecuenciaCardiaca,
        frecuenciaRespiratoria: saved.frecuenciaRespiratoria,
        temperatura: saved.temperatura,
        saturacionOxigeno: saved.saturacionOxigeno,
        glasgow: saved.glasgow,
        peso: saved.peso,
        talla: saved.talla,
        imc: saved.imc,
        plan: saved.plan,
      })
      setPreviewOpen(true)
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la evolución.")
    }
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <HeartOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>
          {editingId ? `Editar Evolución #${editingId}` : "Nueva Evolución"}
        </Typography.Title>
        <div className="evo-header-meta">
          <span>{selectedDoctor}</span>
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
          Esta historia clínica ya fue clausurada y no admite más evoluciones.
        </div>
      )}

      <div className="qx-section">
        <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="section-number">1</span>
          <span className="section-title">Fecha y hora de evolución</span>
        </div>
        <div className="evo-vitals-grid">
          <div className="evo-vital-item">
            <label style={labelStyle}>
              Fecha <span className="field-required">*</span>
            </label>
            <Input
              type="date"
              value={fechaEvolucion}
              onChange={(e) => setFechaEvolucion(e.target.value)}
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
              value={horaEvolucion}
              onChange={(e) => setHoraEvolucion(e.target.value)}
              disabled={historyClosed}
            />
          </div>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">2</span>
          <span className="section-title">Motivo de consulta</span>
        </div>
        <label style={labelStyle}>
          Motivo de consulta <span className="field-required">*</span>
        </label>
        <TextArea
          rows={4}
          value={evoMotivo}
          onChange={(e) => setEvoMotivo(e.target.value)}
          placeholder="Registre el motivo de atención o seguimiento del paciente..."
          maxLength={1000}
          showCount
          disabled={historyClosed}
        />
      </div>

      <div className="qx-section">
        <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="section-number">3</span>
          <span className="section-title">Signos vitales</span>
        </div>
        <div className="evo-vitals-grid">
          {vitalsConfig.map(({ label, key, isString, placeholder }) => (
            <div key={key} className="evo-vital-item">
              <label style={labelStyle}>{label}</label>
              {isString ? (
                <Input
                  value={evoVitals[key] as string}
                  placeholder={placeholder}
                  onChange={(e) => setEvoVitals({ ...evoVitals, [key]: e.target.value })}
                  disabled={historyClosed}
                />
              ) : (
                <InputNumber
                  style={{ width: "100%" }}
                  value={evoVitals[key] as number}
                  placeholder={placeholder}
                  onChange={(v) => setEvoVitals({ ...evoVitals, [key]: Number(v) || 0 })}
                  disabled={historyClosed}
                />
              )}
            </div>
          ))}
          <div className="evo-vital-item">
            <label style={labelStyle}>IMC</label>
            <Input
              value={
                savedImc != null
                  ? `${savedImc} kg/m² (calculado)`
                  : evoBmi
                    ? `${evoBmi} kg/m² (estimado)`
                    : ""
              }
              readOnly
              placeholder="—"
            />
          </div>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">4</span>
          <span className="section-title">Plan</span>
        </div>
        <label style={labelStyle}>
          Plan <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={evoPlan}
          onChange={(e) => setEvoPlan(e.target.value)}
          placeholder="Registre la conducta médica, órdenes clínicas, medicamentos, procedimientos, solicitudes diagnósticas e indicaciones de seguimiento..."
          maxLength={1000}
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
          {editingId ? "Actualizar evolución" : "Guardar evolución"}
        </Button>
      </div>

      <EvolucionesRecentModal
        open={recentOpen}
        onClose={() => setRecentOpen(false)}
        admissionId={admissionId}
        onEdit={loadForEdit}
        messageApi={messageApi}
      />

      <EvolucionPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        title={previewTitle}
        professionalIsReference={previewIsReference}
      />

      <ClinicalRecordHistoryTrigger
        moduleType="evolutions"
        onClick={() => setRecentOpen(true)}
      />
    </div>
  )
}
