"use client"

import { HeartOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Input, InputNumber, Tag, Typography } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { useMemo, useState } from "react"
import { defaultEvoVitals, labelStyle } from "../constants"
import type { EvoVitalsState } from "../types"

interface Props {
  selectedDoctor: string
  patientName: string
  messageApi: MessageInstance
}

const { TextArea } = Input

const vitalsConfig: Array<{ label: string; key: keyof EvoVitalsState; isString?: boolean; placeholder: string }> = [
  { label: "TA (mmHg)", key: "ta", isString: true, placeholder: "120/80" },
  { label: "FC (lpm)", key: "fc", placeholder: "80" },
  { label: "FR (rpm)", key: "fr", placeholder: "18" },
  { label: "Temperatura (°C)", key: "temperature", placeholder: "36.5" },
  { label: "Sat. O₂ (%)", key: "saturation", placeholder: "98" },
  { label: "Peso (kg)", key: "weight", placeholder: "80" },
  { label: "Talla (cm)", key: "height", placeholder: "175" },
]

export const EvolutionSection = ({ selectedDoctor, patientName, messageApi }: Props) => {
  const [evoMotivo, setEvoMotivo] = useState("")
  const [evoPlan, setEvoPlan] = useState("")
  const [evoVitals, setEvoVitals] = useState<EvoVitalsState>({ ...defaultEvoVitals })

  const evoBmi = useMemo(() => {
    const h = evoVitals.height / 100
    if (!h || !evoVitals.weight) return ""
    return (evoVitals.weight / (h * h)).toFixed(1)
  }, [evoVitals.height, evoVitals.weight])

  const reset = () => {
    setEvoMotivo("")
    setEvoPlan("")
    setEvoVitals({ ...defaultEvoVitals })
  }

  const validateAndSave = () => {
    const motivo = evoMotivo.trim()
    if (!motivo || motivo.length < 10) {
      messageApi.error("El motivo de consulta debe tener mínimo 10 caracteres.")
      return
    }
    if (!evoPlan.trim()) {
      messageApi.error("El campo Plan es obligatorio.")
      return
    }
    messageApi.success(`Evolución guardada para ${patientName}.`)
  }

  return (
    <div className="evolution-tab-content evolution-tab-content--full">
      <div className="qx-form-header">
        <HeartOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nueva Evolución</Typography.Title>
        <div className="evo-header-meta">
          <span>{selectedDoctor}</span>
          <span className="evo-header-sep">·</span>
          <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">1</span>
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
          maxLength={2000}
          showCount
        />
        {evoMotivo.length > 0 && evoMotivo.trim().length < 10 && (
          <span className="qx-field-error">Mínimo 10 caracteres.</span>
        )}
      </div>

      <div className="qx-section">
        <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="section-number">2</span>
          <span className="section-title">Signos vitales</span>
          <Tag color="blue" style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600 }}>
            Cargados desde último Triage
          </Tag>
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
                />
              ) : (
                <InputNumber
                  style={{ width: "100%" }}
                  value={evoVitals[key] as number}
                  placeholder={placeholder}
                  onChange={(v) => setEvoVitals({ ...evoVitals, [key]: Number(v) || 0 })}
                />
              )}
            </div>
          ))}
          <div className="evo-vital-item">
            <label style={labelStyle}>IMC</label>
            <Input value={evoBmi ? `${evoBmi} kg/m²` : ""} readOnly placeholder="—" />
          </div>
        </div>
      </div>

      <div className="qx-section">
        <div className="qx-section-header">
          <span className="section-number">3</span>
          <span className="section-title">Plan</span>
        </div>
        <label style={labelStyle}>
          Plan de manejo <span className="field-required">*</span>
        </label>
        <TextArea
          rows={8}
          value={evoPlan}
          onChange={(e) => setEvoPlan(e.target.value)}
          placeholder="Registre la conducta médica, órdenes clínicas, medicamentos, procedimientos, solicitudes diagnósticas e indicaciones de seguimiento..."
          maxLength={5000}
          showCount
        />
      </div>

      <div className="clinical-history-footer-actions">
        <Button onClick={reset}>Limpiar formulario</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
          Guardar evolución
        </Button>
      </div>
    </div>
  )
}
