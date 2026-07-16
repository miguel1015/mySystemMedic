"use client"

import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import { EyeOutlined, FileDoneOutlined, SaveOutlined, WarningOutlined } from "@ant-design/icons"
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import { CSSProperties, useMemo, useState } from "react"
import "../initialClinicalHistory/initialClinicalHistory.css"
import { NotaEgresoPreviewModal } from "./NotaEgresoPreviewModal"
import type { NotaEgresoViewData } from "./NotaEgresoDetailView"

const { TextArea } = Input

const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--dash-text-secondary, #6b7280)",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
}

const ambitoEgresoOptions = [
  { value: "urgencias", label: "Urgencias" },
  { value: "hospitalizacion", label: "Hospitalización" },
  { value: "consulta_externa", label: "Consulta externa" },
  { value: "cirugia", label: "Cirugía" },
  { value: "uci", label: "UCI" },
]

const finalidadConsultaOptions = [
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "rehabilitacion", label: "Rehabilitación" },
  { value: "control", label: "Control" },
  { value: "remision", label: "Remisión" },
]

const causaExternaOptions = [
  { value: "accidente_transito", label: "Accidente de tránsito" },
  { value: "accidente_laboral", label: "Accidente laboral" },
  { value: "violencia", label: "Violencia" },
  { value: "enfermedad_general", label: "Enfermedad general" },
  { value: "accidente_domestico", label: "Accidente doméstico" },
  { value: "accidente_deportivo", label: "Accidente deportivo" },
  { value: "sin_causa", label: "Sin causa externa" },
]

const condicionSalidaOptions = [
  { value: "vivo", label: "Vivo" },
  { value: "fallecido", label: "Fallecido" },
  { value: "traslado", label: "Traslado" },
  { value: "alta_voluntaria", label: "Alta voluntaria" },
  { value: "fuga", label: "Fuga" },
]

const cie10Options = [
  { value: "S202", label: "S202 - Contusion del torax" },
  { value: "S301", label: "S301 - Contusion de la pared abdominal" },
  { value: "S819", label: "S819 - Herida de la pierna, parte no especificada" },
  { value: "R509", label: "R509 - Fiebre no especificada" },
  { value: "I10X", label: "I10X - Hipertension esencial" },
  { value: "E119", label: "E119 - Diabetes mellitus tipo 2 sin complicaciones" },
]

const dischargeTabs = [
  { key: "clinical", label: "1. Datos Clínicos de Egreso" },
  { key: "diagnoses", label: "2. Diagnósticos de Egreso" },
]

interface TextField {
  label: string
  value: string
  setter: (v: string) => void
  required?: boolean
  rows: number
  placeholder: string
  showCount?: boolean
  maxLength?: number
}

interface DischargeNoteContentProps {
  messageApi: MessageInstance
  currentDoctor?: string
}

export function DischargeNoteContent({ messageApi, currentDoctor = "Dr. Martin Martinez Perez" }: DischargeNoteContentProps) {
  const [activeTab, setActiveTab] = useState<"clinical" | "diagnoses">("clinical")

  // Tab 1: Datos Clínicos
  const [vitals, setVitals] = useState({
    ta: "120/80", fc: 80, fr: 18,
    temperature: 36.5, saturation: 98,
    weight: 80, height: 175,
  })
  const [condicionesGenerales, setCondicionesGenerales] = useState("")
  const [cabezaCuello, setCabezaCuello] = useState("")
  const [torax, setTorax] = useState("")
  const [abdomen, setAbdomen] = useState("")
  const [extremidades, setExtremidades] = useState("")
  const [sistemaNervioso, setSistemaNervioso] = useState("")
  const [genitourinario, setGenitourinario] = useState("")
  const [evolucionesTxt, setEvolucionesTxt] = useState("")
  const [justificacion, setJustificacion] = useState("")
  const [ordenes, setOrdenes] = useState("")

  // Tab 2: Diagnósticos
  const [ambitoEgreso, setAmbitoEgreso] = useState<string | undefined>()
  const [fechaEgreso, setFechaEgreso] = useState<Dayjs | null>(null)
  const [diag1, setDiag1] = useState<string | undefined>()
  const [diag2, setDiag2] = useState<string | undefined>()
  const [diag3, setDiag3] = useState<string | undefined>()
  const [diagnosticoMuerte, setDiagnosticoMuerte] = useState("")
  const [fechaMuerte, setFechaMuerte] = useState<Dayjs | null>(null)
  const [finalidadConsulta, setFinalidadConsulta] = useState<string | undefined>()
  const [causaExterna, setCausaExterna] = useState<string | undefined>()
  const [condicionSalida, setCondicionSalida] = useState<string | undefined>()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<NotaEgresoViewData | null>(null)

  const isDeceased = condicionSalida === "fallecido"

  const bmi = useMemo(() => {
    const h = vitals.height / 100
    if (!h || !vitals.weight) return ""
    return (vitals.weight / (h * h)).toFixed(1)
  }, [vitals.height, vitals.weight])

  const resetForm = () => {
    setVitals({ ta: "120/80", fc: 80, fr: 18, temperature: 36.5, saturation: 98, weight: 80, height: 175 })
    setCondicionesGenerales("")
    setCabezaCuello("")
    setTorax("")
    setAbdomen("")
    setExtremidades("")
    setSistemaNervioso("")
    setGenitourinario("")
    setEvolucionesTxt("")
    setJustificacion("")
    setOrdenes("")
    setAmbitoEgreso(undefined)
    setFechaEgreso(null)
    setDiag1(undefined)
    setDiag2(undefined)
    setDiag3(undefined)
    setDiagnosticoMuerte("")
    setFechaMuerte(null)
    setFinalidadConsulta(undefined)
    setCausaExterna(undefined)
    setCondicionSalida(undefined)
  }

  const openPreview = () => {
    setPreviewData({
      vitals,
      bmi,
      condicionesGenerales,
      cabezaCuello,
      torax,
      abdomen,
      extremidades,
      sistemaNervioso,
      genitourinario,
      evolucionesTxt,
      justificacion,
      ordenes,
      ambitoEgreso: ambitoEgresoOptions.find((o) => o.value === ambitoEgreso)?.label,
      fechaEgreso: fechaEgreso ? fechaEgreso.format("DD/MM/YYYY HH:mm") : "",
      diag1: cie10Options.find((o) => o.value === diag1)?.label,
      diag2: cie10Options.find((o) => o.value === diag2)?.label,
      diag3: cie10Options.find((o) => o.value === diag3)?.label,
      finalidadConsulta: finalidadConsultaOptions.find((o) => o.value === finalidadConsulta)?.label,
      causaExterna: causaExternaOptions.find((o) => o.value === causaExterna)?.label,
      condicionSalida: condicionSalidaOptions.find((o) => o.value === condicionSalida)?.label,
      diagnosticoMuerte,
      fechaMuerte: fechaMuerte ? fechaMuerte.format("DD/MM/YYYY HH:mm") : "",
    })
    setPreviewOpen(true)
  }

  const validateAndSave = () => {
    if (!condicionesGenerales.trim()) {
      messageApi.error("Las condiciones generales de salida son obligatorias.")
      setActiveTab("clinical")
      return
    }
    if (!ambitoEgreso) {
      messageApi.error("El ámbito de egreso es obligatorio.")
      setActiveTab("diagnoses")
      return
    }
    if (!fechaEgreso) {
      messageApi.error("La fecha de egreso es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (!diag1) {
      messageApi.error("Debe registrar el diagnóstico de egreso principal.")
      setActiveTab("diagnoses")
      return
    }
    if (!condicionSalida) {
      messageApi.error("La condición de salida del paciente es obligatoria.")
      setActiveTab("diagnoses")
      return
    }
    if (isDeceased && !diagnosticoMuerte.trim()) {
      messageApi.error("El diagnóstico de muerte es obligatorio cuando la condición es fallecimiento.")
      setActiveTab("diagnoses")
      return
    }
    if (isDeceased && !fechaMuerte) {
      messageApi.error("La fecha de muerte es obligatoria cuando la condición es fallecimiento.")
      setActiveTab("diagnoses")
      return
    }
    messageApi.success("Nota de egreso guardada correctamente.")
  }

  const clinicalTextFields: TextField[] = [
    {
      label: "Condiciones generales de salida",
      value: condicionesGenerales,
      setter: setCondicionesGenerales,
      required: true,
      rows: 3,
      placeholder: "Describa las condiciones generales del paciente al momento del egreso...",
      showCount: true,
      maxLength: 2000,
    },
    {
      label: "Cabeza y cuello",
      value: cabezaCuello,
      setter: setCabezaCuello,
      rows: 2,
      placeholder: "Hallazgos en cabeza y cuello...",
    },
    {
      label: "Tórax",
      value: torax,
      setter: setTorax,
      rows: 2,
      placeholder: "Hallazgos en tórax...",
    },
    {
      label: "Abdomen",
      value: abdomen,
      setter: setAbdomen,
      rows: 2,
      placeholder: "Hallazgos en abdomen...",
    },
    {
      label: "Extremidades",
      value: extremidades,
      setter: setExtremidades,
      rows: 2,
      placeholder: "Hallazgos en extremidades...",
    },
    {
      label: "Sistema nervioso",
      value: sistemaNervioso,
      setter: setSistemaNervioso,
      rows: 2,
      placeholder: "Hallazgos en sistema nervioso...",
    },
    {
      label: "Genitourinario",
      value: genitourinario,
      setter: setGenitourinario,
      rows: 2,
      placeholder: "Hallazgos en genitourinario...",
    },
    {
      label: "Evoluciones",
      value: evolucionesTxt,
      setter: setEvolucionesTxt,
      rows: 3,
      placeholder: "Resumen de evolución clínica durante la hospitalización...",
      showCount: true,
      maxLength: 3000,
    },
    {
      label: "Justificación de hospitalización",
      value: justificacion,
      setter: setJustificacion,
      rows: 3,
      placeholder: "Justificación clínica del ingreso y hospitalización del paciente...",
      showCount: true,
      maxLength: 3000,
    },
    {
      label: "Órdenes",
      value: ordenes,
      setter: setOrdenes,
      rows: 3,
      placeholder: "Indicaciones, medicamentos y órdenes al egreso...",
      showCount: true,
      maxLength: 3000,
    },
  ]

  return (
    <>
      <div className="tabs-card">
      <div className="qx-form-header">
        <FileDoneOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
        <Typography.Title level={5} style={{ margin: 0 }}>Nota de Egreso</Typography.Title>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={openPreview}>
            Vista previa
          </Button>
        </div>
      </div>

      <nav className="clinical-section-tabs" aria-label="Secciones nota de egreso">
        {dischargeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key as "clinical" | "diagnoses")}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="evolution-tab-content">

        {/* ─── Tab 1: Datos Clínicos de Egreso ─── */}
        {activeTab === "clinical" && (
          <div className="tab-section-inner">

            {/* Signos vitales */}
            <div className="qx-section" style={{ padding: "0 0 20px", marginBottom: 20, borderBottom: "1px solid var(--dash-border-subtle, #eef2f1)" }}>
              <div className="qx-section-header">
                <span className="section-number">1</span>
                <span className="section-title">Signos vitales</span>
              </div>
              <div className="evo-vitals-grid">
                {([
                  { label: "TA (mmHg)", key: "ta", isString: true },
                  { label: "FC (lpm)", key: "fc" },
                  { label: "FR (rpm)", key: "fr" },
                  { label: "Temperatura (°C)", key: "temperature" },
                  { label: "Sat. O₂ (%)", key: "saturation" },
                  { label: "Peso (kg)", key: "weight" },
                  { label: "Talla (cm)", key: "height" },
                ] as Array<{ label: string; key: string; isString?: boolean }>).map(({ label, key, isString }) => (
                  <div key={key} className="evo-vital-item">
                    <label style={labelStyle}>{label}</label>
                    {isString ? (
                      <Input
                        value={(vitals as Record<string, number | string>)[key] as string}
                        onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })}
                      />
                    ) : (
                      <InputNumber
                        style={{ width: "100%" }}
                        value={(vitals as Record<string, number | string>)[key] as number}
                        onChange={(v) => setVitals({ ...vitals, [key]: Number(v) || 0 })}
                      />
                    )}
                  </div>
                ))}
                <div className="evo-vital-item">
                  <label style={labelStyle}>IMC</label>
                  <Input value={bmi ? `${bmi} kg/m²` : ""} readOnly placeholder="—" />
                </div>
              </div>
            </div>

            {/* Campos de texto clínicos */}
            <div style={{ display: "grid", gap: 16 }}>
              {clinicalTextFields.map(({ label, value, setter, required, rows, placeholder, showCount, maxLength }) => (
                <div key={label}>
                  <label style={labelStyle}>
                    {label}
                    {required && <span className="field-required"> *</span>}
                  </label>
                  <TextArea
                    rows={rows}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    showCount={showCount}
                    maxLength={maxLength}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Tab 2: Diagnósticos de Egreso ─── */}
        {activeTab === "diagnoses" && (
          <div className="tab-section-inner">
            <div style={{ display: "grid", gap: 16 }}>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Ámbito de egreso <span className="field-required">*</span></label>
                  <Select
                    placeholder="Seleccione ámbito"
                    value={ambitoEgreso}
                    options={ambitoEgresoOptions}
                    onChange={setAmbitoEgreso}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de egreso <span className="field-required">*</span></label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    value={fechaEgreso}
                    onChange={setFechaEgreso}
                    style={{ width: "100%" }}
                    placeholder="Seleccione fecha y hora"
                    disabledDate={(current) => current && current.isAfter(dayjs())}
                  />
                </div>
              </div>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Diagnóstico de egreso 1 <span className="field-required">*</span></label>
                  <Select
                    showSearch
                    placeholder="Buscar código CIE-10"
                    value={diag1}
                    options={cie10Options}
                    onChange={setDiag1}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Diagnóstico de egreso 2</label>
                  <Select
                    showSearch
                    placeholder="Buscar código CIE-10"
                    value={diag2}
                    options={cie10Options}
                    onChange={setDiag2}
                    style={{ width: "100%" }}
                    allowClear
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Diagnóstico de egreso 3</label>
                <Select
                  showSearch
                  placeholder="Buscar código CIE-10"
                  value={diag3}
                  options={cie10Options}
                  onChange={setDiag3}
                  style={{ width: "100%", maxWidth: 480 }}
                  allowClear
                />
              </div>

              <div className="qx-grid-2">
                <div>
                  <label style={labelStyle}>Finalidad de consulta</label>
                  <Select
                    placeholder="Seleccione finalidad"
                    value={finalidadConsulta}
                    options={finalidadConsultaOptions}
                    onChange={setFinalidadConsulta}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Causa externa</label>
                  <Select
                    placeholder="Seleccione causa externa"
                    value={causaExterna}
                    options={causaExternaOptions}
                    onChange={setCausaExterna}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Condición salida paciente <span className="field-required">*</span></label>
                <Select
                  placeholder="Seleccione condición de salida"
                  value={condicionSalida}
                  options={condicionSalidaOptions}
                  onChange={(v) => {
                    setCondicionSalida(v)
                    if (v !== "fallecido") {
                      setDiagnosticoMuerte("")
                      setFechaMuerte(null)
                    }
                  }}
                  style={{ width: "100%", maxWidth: 380 }}
                />
              </div>

              {isDeceased && (
                <div
                  style={{
                    background: "#fff1f0",
                    border: "1px solid #ffa39e",
                    borderRadius: 8,
                    padding: 16,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <WarningOutlined style={{ color: "#cf1322", fontSize: 16 }} />
                    <Typography.Text style={{ color: "#cf1322", fontWeight: 700 }}>
                      Datos de fallecimiento
                    </Typography.Text>
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Diagnóstico de muerte <span className="field-required">*</span>
                    </label>
                    <TextArea
                      rows={3}
                      value={diagnosticoMuerte}
                      onChange={(e) => setDiagnosticoMuerte(e.target.value)}
                      placeholder="Describa la causa directa o indirecta de muerte del paciente..."
                      showCount
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Fecha de muerte <span className="field-required">*</span>
                    </label>
                    <DatePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      value={fechaMuerte}
                      onChange={setFechaMuerte}
                      style={{ width: "100%", maxWidth: 380 }}
                      placeholder="Seleccione fecha y hora"
                      disabledDate={(current) => current && current.isAfter(dayjs())}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        <div className="clinical-history-footer-actions">
          <Button onClick={resetForm}>Limpiar formulario</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
            Guardar nota de egreso
          </Button>
        </div>
      </div>
      </div>

      <NotaEgresoPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
      />
    </>
  )
}
