"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import ClinicalRecordHistoryModal from "@/components/clinicalRecordHistoryModal"
import ClinicalRecordHistoryTrigger from "@/components/clinicalRecordHistoryModal/ClinicalRecordHistoryTrigger"
import { EvolutionSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolutionSection"
import { MedicalNotesSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/MedicalNotesSection"
import { MinorProceduresSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/MinorProceduresSection"
import { SpecialistEvolutionSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/SpecialistEvolutionSection"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { useCreateProcedimientoNoQx } from "@/core/hooks/care/procedimientosNoQx/useSaveProcedimientoNoQx"
import { useCreateNotaEnfermeria } from "@/core/hooks/care/notasEnfermeria/useSaveNotaEnfermeria"
import { GetUser } from "@/core/interfaces/user/users"
import type { Dayjs } from "dayjs"
import {
  ArrowLeftOutlined,
  AuditOutlined,
  CalendarOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  FileDoneOutlined,
  FormOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { CSSProperties, ReactNode, useMemo, useState } from "react"
import "../clinicalRecords/initialClinicalHistory/initialClinicalHistory.css"

const { TextArea } = Input

// ─────────────────────────────────────────────────────────────
// Generic placeholder (default export — used by all other pages)
// ─────────────────────────────────────────────────────────────
interface ClinicalRecordPlaceholderProps {
  title: string
  icon: ReactNode
}

const ClinicalRecordPlaceholder = ({
  title,
  icon,
}: ClinicalRecordPlaceholderProps) => {
  const router = useRouter()

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--theme-primary, #0F6F5C)", fontSize: 22 }}>
            {icon}
          </span>
          <Title level={3}>{title}</Title>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div
        style={{
          minHeight: 360,
          border: "1px solid var(--dash-border, #e5e7eb)",
          borderRadius: 8,
          backgroundColor: "var(--dash-surface, #ffffff)",
        }}
      />
    </Container>
  )
}

export default ClinicalRecordPlaceholder

// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────
interface QxSearchItem {
  code: string
  description: string
}

const cupsOptions = [
  { value: "45003", label: "45003 - Laparoscopia diagnóstica", description: "Laparoscopia diagnóstica" },
  { value: "45200", label: "45200 - Apendicectomía laparoscópica", description: "Apendicectomía laparoscópica" },
  { value: "47600", label: "47600 - Colecistectomía laparoscópica", description: "Colecistectomía laparoscópica" },
  { value: "54500", label: "54500 - Hernioplastia inguinal", description: "Hernioplastia inguinal" },
  { value: "54550", label: "54550 - Hernioplastia umbilical", description: "Hernioplastia umbilical" },
  { value: "27130", label: "27130 - Artroplastia total de cadera", description: "Artroplastia total de cadera" },
  { value: "27447", label: "27447 - Artroplastia total de rodilla", description: "Artroplastia total de rodilla" },
  { value: "43239", label: "43239 - Endoscopia digestiva superior con biopsia", description: "Endoscopia digestiva superior con biopsia" },
]

const cie10Options = [
  { value: "S202", label: "S202 - Contusion del torax", diagnosis: "Contusion del torax" },
  { value: "S301", label: "S301 - Contusion de la pared abdominal", diagnosis: "Contusion de la pared abdominal" },
  { value: "S819", label: "S819 - Herida de la pierna, parte no especificada", diagnosis: "Herida de la pierna, parte no especificada" },
  { value: "R509", label: "R509 - Fiebre no especificada", diagnosis: "Fiebre no especificada" },
  { value: "I10X", label: "I10X - Hipertension esencial", diagnosis: "Hipertension esencial" },
  { value: "E119", label: "E119 - Diabetes mellitus tipo 2 sin complicaciones", diagnosis: "Diabetes mellitus tipo 2 sin complicaciones" },
]

const anesthesiaTypeOptions = [
  { value: "general", label: "Anestesia general" },
  { value: "regional", label: "Anestesia regional" },
  { value: "local", label: "Anestesia local" },
  { value: "sedacion", label: "Sedación" },
  { value: "epidural", label: "Epidural" },
  { value: "raquianestesia", label: "Raquianestesia" },
  { value: "combinada", label: "Combinada (general + regional)" },
]

const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--dash-text-secondary, #6b7280)",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
}

const buildFullName = (user?: GetUser) => {
  if (!user) return ""
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || user.email
}

const formatDate = (value: string | null) => {
  if (!value) return "03/03/2026 20:47"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("es-CO", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return "21 años"
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
  return `${age} años`
}

// ─────────────────────────────────────────────────────────────
// Standalone Surgical Description (named export)
// ─────────────────────────────────────────────────────────────
export const SurgicalDescriptionContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()
  const { data: users = [] } = useGetUsers()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"

  const doctorOptions = useMemo(() => {
    const mapped = users.map((user) => ({
      value: user.id,
      label: buildFullName(user),
    }))
    if (mapped.length) return mapped
    return [{ value: me?.id || 0, label: currentDoctor }]
  }, [currentDoctor, me?.id, users])

  const [qxStartDate, setQxStartDate] = useState<Dayjs | null>(null)
  const [qxEndDate, setQxEndDate] = useState<Dayjs | null>(null)
  const [qxSurgeon, setQxSurgeon] = useState<number | undefined>()
  const [qxAnesthesiologist, setQxAnesthesiologist] = useState<number | undefined>()
  const [qxInstrumenter, setQxInstrumenter] = useState<number | undefined>()
  const [qxAssistant, setQxAssistant] = useState<number | undefined>()
  const [qxAnesthesiaType, setQxAnesthesiaType] = useState<string | undefined>()
  const [qxProcedures, setQxProcedures] = useState<QxSearchItem[]>([{ code: "", description: "" }])
  const [qxDiagnoses, setQxDiagnoses] = useState<QxSearchItem[]>([{ code: "", description: "" }])
  const [qxProcedureDescription, setQxProcedureDescription] = useState("")

  const addQxProcedure = () => {
    if (qxProcedures.length >= 4) return
    setQxProcedures((p) => [...p, { code: "", description: "" }])
  }
  const removeQxProcedure = (idx: number) =>
    setQxProcedures((p) => p.filter((_, i) => i !== idx))
  const updateQxProcedure = (idx: number, patch: Partial<QxSearchItem>) =>
    setQxProcedures((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const addQxDiagnosis = () => {
    if (qxDiagnoses.length >= 4) return
    setQxDiagnoses((p) => [...p, { code: "", description: "" }])
  }
  const removeQxDiagnosis = (idx: number) =>
    setQxDiagnoses((p) => p.filter((_, i) => i !== idx))
  const updateQxDiagnosis = (idx: number, patch: Partial<QxSearchItem>) =>
    setQxDiagnoses((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const resetForm = () => {
    setQxStartDate(null)
    setQxEndDate(null)
    setQxSurgeon(undefined)
    setQxAnesthesiologist(undefined)
    setQxInstrumenter(undefined)
    setQxAssistant(undefined)
    setQxAnesthesiaType(undefined)
    setQxProcedures([{ code: "", description: "" }])
    setQxDiagnoses([{ code: "", description: "" }])
    setQxProcedureDescription("")
  }

  const handleSave = () => {
    if (!qxStartDate) { messageApi.error("La fecha inicial de ejecución es obligatoria."); return }
    if (!qxEndDate) { messageApi.error("La fecha final de ejecución es obligatoria."); return }
    if (qxEndDate.isBefore(qxStartDate)) { messageApi.error("La fecha final no puede ser menor que la fecha inicial."); return }
    if (!qxSurgeon) { messageApi.error("El cirujano es obligatorio."); return }
    if (!qxAnesthesiologist) { messageApi.error("El anestesiólogo es obligatorio."); return }
    if (!qxInstrumenter) { messageApi.error("El instrumentador es obligatorio."); return }
    if (!qxAssistant) { messageApi.error("El ayudante quirúrgico es obligatorio."); return }
    if (!qxAnesthesiaType) { messageApi.error("El tipo de anestesia es obligatorio."); return }
    if (!qxProcedures[0]?.code) { messageApi.error("El procedimiento principal (CUPS/SOAT) es obligatorio."); return }
    if (!qxDiagnoses[0]?.code) { messageApi.error("El diagnóstico de ingreso principal (CIE-10) es obligatorio."); return }
    if (!qxProcedureDescription.trim()) { messageApi.error("La descripción del procedimiento es obligatoria."); return }
    messageApi.success("Descripción quirúrgica guardada correctamente.")
  }

  const admissionId = searchParams.get("admissionId") || undefined
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">

        {/* ════ HEADER ════ */}
        <div
          className="clinical-history-header"
          style={{
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            background: "var(--dash-surface, #fff)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div className="patient-avatar">
                {patient.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title level={4} style={{ margin: 0 }} className="clinical-history-patient-title">
                  {patient.name}
                </Typography.Title>
                <div className="patient-meta">
                  <span className="patient-meta-chip">
                    {patient.documentType} {patient.documentNumber}
                  </span>
                  <span className="patient-meta-chip">
                    <CalendarOutlined /> {calculateAge(patient.birthDate)}
                  </span>
                  <span className="patient-meta-chip">
                    <UserOutlined /> {patient.sex}
                  </span>
                  <span className="patient-meta-chip">{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="clinical-history-actions">
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Guardar
              </Button>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de ingreso</div>
              <div className="summary-cell-value">{patient.admissionDate}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Servicio</div>
              <div className="summary-cell-value">{patient.careScope}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Médico tratante</div>
              <div className="summary-cell-value">{currentDoctor}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ FORM CARD ════ */}
        <div
          style={{
            marginTop: 14,
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Form title */}
          <div className="qx-form-header">
            <MedicineBoxOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
            <Typography.Title level={5} style={{ margin: 0 }}>Descripción Quirúrgica</Typography.Title>
          </div>

          {/* ── Sección 1: Fechas ── */}
          <div className="qx-section">
            <div className="qx-section-header">
              <span className="section-number">1</span>
              <span className="section-title">Fechas de ejecución</span>
            </div>
            <div className="qx-grid-2">
              <div>
                <label style={labelStyle}>
                  Fecha inicial de ejecución <span className="field-required">*</span>
                </label>
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  value={qxStartDate}
                  onChange={setQxStartDate}
                  style={{ width: "100%" }}
                  placeholder="Seleccione fecha y hora"
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Fecha final de ejecución <span className="field-required">*</span>
                </label>
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  value={qxEndDate}
                  onChange={setQxEndDate}
                  style={{ width: "100%" }}
                  placeholder="Seleccione fecha y hora"
                  disabledDate={(current) =>
                    qxStartDate ? current && current.isBefore(qxStartDate.startOf("day")) : false
                  }
                />
                {qxStartDate && qxEndDate && qxEndDate.isBefore(qxStartDate) && (
                  <span className="qx-field-error">
                    La fecha final no puede ser menor que la fecha inicial.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Sección 2: Equipo quirúrgico ── */}
          <div className="qx-section">
            <div className="qx-section-header">
              <span className="section-number">2</span>
              <span className="section-title">Equipo quirúrgico</span>
            </div>
            <div className="qx-grid-2">
              <div>
                <label style={labelStyle}>Cirujano <span className="field-required">*</span></label>
                <Select
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Seleccione cirujano"
                  value={qxSurgeon}
                  options={doctorOptions}
                  onChange={setQxSurgeon}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Anestesiólogo <span className="field-required">*</span></label>
                <Select
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Seleccione anestesiólogo"
                  value={qxAnesthesiologist}
                  options={doctorOptions}
                  onChange={setQxAnesthesiologist}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Instrumentador <span className="field-required">*</span></label>
                <Select
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Seleccione instrumentador"
                  value={qxInstrumenter}
                  options={doctorOptions}
                  onChange={setQxInstrumenter}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Ayudante Qx <span className="field-required">*</span></label>
                <Select
                  showSearch={{ optionFilterProp: "label" }}
                  placeholder="Seleccione ayudante quirúrgico"
                  value={qxAssistant}
                  options={doctorOptions}
                  onChange={setQxAssistant}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* ── Sección 3: Tipo de anestesia ── */}
          <div className="qx-section">
            <div className="qx-section-header">
              <span className="section-number">3</span>
              <span className="section-title">Tipo de anestesia</span>
            </div>
            <div className="qx-field-narrow">
              <label style={labelStyle}>Tipo de anestesia <span className="field-required">*</span></label>
              <Select
                placeholder="Seleccione tipo de anestesia"
                value={qxAnesthesiaType}
                options={anesthesiaTypeOptions}
                onChange={setQxAnesthesiaType}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* ── Sección 4: Procedimientos CUPS/SOAT ── */}
          <div className="qx-section">
            <div className="qx-section-header-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="section-number">4</span>
                <span className="section-title">Procedimientos (CUPS/SOAT)</span>
              </div>
              {qxProcedures.length < 4 && (
                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addQxProcedure}>
                  Agregar procedimiento
                </Button>
              )}
            </div>
            <div className="qx-items-list">
              {qxProcedures.map((proc, idx) => (
                <div key={idx} className="qx-item-row">
                  <div className="qx-item-tag-wrap">
                    <Tag color={idx === 0 ? "blue" : "default"}>
                      {idx === 0 ? "Principal *" : `Procedimiento ${idx + 1}`}
                      {idx > 0 && <span className="qx-optional-text"> – Opcional</span>}
                    </Tag>
                  </div>
                  <div className="qx-item-fields">
                    <Select
                      showSearch={{ optionFilterProp: "label" }}
                      placeholder="Buscar por código CUPS/SOAT o descripción"
                      value={proc.code || undefined}
                      options={cupsOptions}
                      style={{ flex: "1 1 220px", minWidth: 0 }}
                      onChange={(value) => {
                        const found = cupsOptions.find((o) => o.value === value)
                        updateQxProcedure(idx, { code: value, description: found?.description || "" })
                      }}
                    />
                    <Input
                      placeholder="Descripción del procedimiento"
                      value={proc.description}
                      onChange={(e) => updateQxProcedure(idx, { description: e.target.value })}
                      style={{ flex: "1 1 200px", minWidth: 0 }}
                    />
                    {idx > 0 && (
                      <Tooltip title="Eliminar procedimiento">
                        <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeQxProcedure(idx)} />
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sección 5: Diagnósticos de ingreso CIE-10 ── */}
          <div className="qx-section">
            <div className="qx-section-header-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="section-number">5</span>
                <span className="section-title">Diagnósticos de ingreso (CIE-10)</span>
              </div>
              {qxDiagnoses.length < 4 && (
                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addQxDiagnosis}>
                  Agregar diagnóstico
                </Button>
              )}
            </div>
            <div className="qx-items-list">
              {qxDiagnoses.map((diag, idx) => (
                <div key={idx} className="qx-item-row">
                  <div className="qx-item-tag-wrap">
                    <Tag color={idx === 0 ? "blue" : "default"}>
                      {idx === 0 ? "Principal *" : `Diagnóstico ${idx + 1}`}
                      {idx > 0 && <span className="qx-optional-text"> – Opcional</span>}
                    </Tag>
                  </div>
                  <div className="qx-item-fields">
                    <Select
                      showSearch={{ optionFilterProp: "label" }}
                      placeholder="Buscar por código CIE-10 o descripción"
                      value={diag.code || undefined}
                      options={cie10Options}
                      style={{ flex: "1 1 220px", minWidth: 0 }}
                      onChange={(value) => {
                        const found = cie10Options.find((o) => o.value === value)
                        updateQxDiagnosis(idx, { code: value, description: found?.diagnosis || "" })
                      }}
                    />
                    <Input
                      placeholder="Descripción del diagnóstico"
                      value={diag.description}
                      onChange={(e) => updateQxDiagnosis(idx, { description: e.target.value })}
                      style={{ flex: "1 1 200px", minWidth: 0 }}
                    />
                    {idx > 0 && (
                      <Tooltip title="Eliminar diagnóstico">
                        <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeQxDiagnosis(idx)} />
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sección 6: Descripción del procedimiento ── */}
          <div className="qx-section">
            <div className="qx-section-header">
              <span className="section-number">6</span>
              <span className="section-title">Descripción del procedimiento</span>
            </div>
            <label className="field-label">
              Descripción del procedimiento <span className="field-required">*</span>
            </label>
            <TextArea
              rows={8}
              value={qxProcedureDescription}
              onChange={(e) => setQxProcedureDescription(e.target.value)}
              placeholder="Describa de forma detallada el acto quirúrgico realizado, hallazgos intraoperatorios, técnica empleada y demás consideraciones clínicas relevantes..."
              maxLength={10000}
            />
            <div className="char-count-row">{qxProcedureDescription.length} / 10000</div>
          </div>

          {/* ── Footer ── */}
          <div className="clinical-history-footer-actions">
            <Button onClick={resetForm}>Limpiar formulario</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Guardar descripción quirúrgica
            </Button>
          </div>
        </div>

      </div>
      <ClinicalRecordHistoryTrigger
        moduleType="surgical-description"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="surgical-description"
        admissionId={admissionId}
      />
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Evolutions page
// ─────────────────────────────────────────────────────────────
export const EvolutionsContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()
  const { data: users = [] } = useGetUsers()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"

  const doctorOptions = useMemo(() => {
    const mapped = users.map((user) => ({
      value: user.id,
      label: buildFullName(user),
    }))
    if (mapped.length) return mapped
    return [{ value: me?.id || 0, label: currentDoctor }]
  }, [currentDoctor, me?.id, users])

  const selectedDoctor = doctorOptions[0]?.label || currentDoctor

  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">

        {/* ════ HEADER ════ */}
        <div
          className="clinical-history-header"
          style={{
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            background: "var(--dash-surface, #fff)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div className="patient-avatar">
                {patient.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title level={4} style={{ margin: 0 }} className="clinical-history-patient-title">
                  {patient.name}
                </Typography.Title>
                <div className="patient-meta">
                  <span className="patient-meta-chip">
                    {patient.documentType} {patient.documentNumber}
                  </span>
                  <span className="patient-meta-chip">
                    <CalendarOutlined /> {calculateAge(patient.birthDate)}
                  </span>
                  <span className="patient-meta-chip">
                    <UserOutlined /> {patient.sex}
                  </span>
                  <span className="patient-meta-chip">{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="clinical-history-actions">
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de ingreso</div>
              <div className="summary-cell-value">{patient.admissionDate}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Servicio</div>
              <div className="summary-cell-value">{patient.careScope}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Médico tratante</div>
              <div className="summary-cell-value">{currentDoctor}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ FORM ════ */}
        <div
          style={{
            marginTop: 14,
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <EvolutionSection
            admissionId={admissionId}
            selectedDoctor={selectedDoctor}
            patientName={patient.name}
            messageApi={messageApi}
          />
        </div>

      </div>
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Nursing Notes page
// ─────────────────────────────────────────────────────────────
export const NursingNotesContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentNurse = me?.name || "Enf. Maria Gonzalez"

  const [nota, setNota] = useState("")
  const createNotaEnfermeria = useCreateNotaEnfermeria()

  const resetForm = () => setNota("")

  const admissionId = searchParams.get("admissionId") || undefined
  const [historyOpen, setHistoryOpen] = useState(false)

  const handleSave = async () => {
    if (!nota.trim()) {
      messageApi.error("La nota de enfermería es obligatoria.")
      return
    }
    if (!admissionId) {
      messageApi.error("No se encontró la admisión asociada a esta nota.")
      return
    }

    try {
      await createNotaEnfermeria.mutateAsync({
        admissionId: Number(admissionId),
        nota: nota.trim(),
      })
      messageApi.success(`Nota de enfermería guardada para ${patient.name}.`)
      resetForm()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar la nota de enfermería.")
    }
  }

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">

        {/* ════ HEADER ════ */}
        <div
          className="clinical-history-header"
          style={{
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            background: "var(--dash-surface, #fff)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div className="patient-avatar">
                {patient.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title level={4} style={{ margin: 0 }} className="clinical-history-patient-title">
                  {patient.name}
                </Typography.Title>
                <div className="patient-meta">
                  <span className="patient-meta-chip">
                    {patient.documentType} {patient.documentNumber}
                  </span>
                  <span className="patient-meta-chip">
                    <CalendarOutlined /> {calculateAge(patient.birthDate)}
                  </span>
                  <span className="patient-meta-chip">
                    <UserOutlined /> {patient.sex}
                  </span>
                  <span className="patient-meta-chip">{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="clinical-history-actions">
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Guardar
              </Button>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de ingreso</div>
              <div className="summary-cell-value">{patient.admissionDate}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Servicio</div>
              <div className="summary-cell-value">{patient.careScope}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Enfermero/a</div>
              <div className="summary-cell-value">{currentNurse}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ FORM ════ */}
        <div
          style={{
            marginTop: 14,
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div className="evolution-tab-content evolution-tab-content--full">

            {/* Form header */}
            <div className="qx-form-header">
              <FormOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
              <Typography.Title level={5} style={{ margin: 0 }}>Nueva Nota de Enfermería</Typography.Title>
              <div className="evo-header-meta">
                <span>{currentNurse}</span>
                <span className="evo-header-sep">·</span>
                <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
            </div>

            {/* Sección única: Nota de Enfermería */}
            <div className="qx-section">
              <div className="qx-section-header">
                <span className="section-number">1</span>
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
              />
            </div>

            <div className="clinical-history-footer-actions">
              <Button onClick={resetForm}>Limpiar formulario</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={createNotaEnfermeria.isPending}
                onClick={handleSave}
              >
                Guardar nota de enfermería
              </Button>
            </div>
          </div>
        </div>

      </div>
      <ClinicalRecordHistoryTrigger
        moduleType="nursing-notes"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="nursing-notes"
        admissionId={admissionId}
      />
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Diagnostic Procedures page
// ─────────────────────────────────────────────────────────────
export const DiagnosticProceduresContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"

  const [estudios, setEstudios] = useState("")
  const [hallazgos, setHallazgos] = useState("")

  const resetForm = () => {
    setEstudios("")
    setHallazgos("")
  }

  const handleSave = () => {
    if (!estudios.trim()) {
      messageApi.error("El campo Estudios realizados es obligatorio.")
      return
    }
    if (!hallazgos.trim()) {
      messageApi.error("El campo Hallazgos es obligatorio.")
      return
    }
    messageApi.success(`Procedimiento diagnóstico guardado para ${patient.name}.`)
  }

  const admissionId = searchParams.get("admissionId") || undefined
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">

        {/* ════ HEADER ════ */}
        <div
          className="clinical-history-header"
          style={{
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            background: "var(--dash-surface, #fff)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div className="patient-avatar">
                {patient.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title level={4} style={{ margin: 0 }} className="clinical-history-patient-title">
                  {patient.name}
                </Typography.Title>
                <div className="patient-meta">
                  <span className="patient-meta-chip">
                    {patient.documentType} {patient.documentNumber}
                  </span>
                  <span className="patient-meta-chip">
                    <CalendarOutlined /> {calculateAge(patient.birthDate)}
                  </span>
                  <span className="patient-meta-chip">
                    <UserOutlined /> {patient.sex}
                  </span>
                  <span className="patient-meta-chip">{patient.birthDate}</span>
                </div>
              </div>
            </div>

            <div className="clinical-history-actions">
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Guardar
              </Button>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de ingreso</div>
              <div className="summary-cell-value">{patient.admissionDate}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Servicio</div>
              <div className="summary-cell-value">{patient.careScope}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Médico tratante</div>
              <div className="summary-cell-value">{currentDoctor}</div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ FORM ════ */}
        <div
          style={{
            marginTop: 14,
            background: "var(--dash-surface, #fff)",
            border: "1px solid var(--dash-border, #e4eae8)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div className="evolution-tab-content evolution-tab-content--full">

            <div className="qx-form-header">
              <ExperimentOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
              <Typography.Title level={5} style={{ margin: 0 }}>Nuevo Procedimiento Diagnóstico</Typography.Title>
              <div className="evo-header-meta">
                <span>{currentDoctor}</span>
                <span className="evo-header-sep">·</span>
                <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
            </div>

            {/* Sección 1: Estudios realizados */}
            <div className="qx-section">
              <div className="qx-section-header">
                <span className="section-number">1</span>
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
                maxLength={10000}
                showCount
              />
            </div>

            {/* Sección 2: Hallazgos */}
            <div className="qx-section">
              <div className="qx-section-header">
                <span className="section-number">2</span>
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
                maxLength={10000}
                showCount
              />
            </div>

            <div className="clinical-history-footer-actions">
              <Button onClick={resetForm}>Limpiar formulario</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Guardar procedimiento diagnóstico
              </Button>
            </div>
          </div>
        </div>

      </div>
      <ClinicalRecordHistoryTrigger
        moduleType="diagnostic-procedures"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="diagnostic-procedures"
        admissionId={admissionId}
      />
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Shared header renderer for simple two-field containers
// ─────────────────────────────────────────────────────────────
interface SimpleFormProps {
  patient: {
    name: string; documentType: string; documentNumber: string
    careScope: string; admissionDate: string; birthDate: string; sex: string
  }
  currentDoctor: string
  router: ReturnType<typeof useRouter>
  onSave: () => void
  hideSave?: boolean
}

const PatientHeader = ({ patient, currentDoctor, router, onSave, hideSave }: SimpleFormProps) => (
  <div
    className="clinical-history-header"
    style={{
      border: "1px solid var(--dash-border, #e4eae8)",
      borderRadius: 10,
      background: "var(--dash-surface, #fff)",
      position: "sticky",
      top: 0,
      zIndex: 20,
      overflow: "hidden",
      boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
    }}
  >
    <div className="clinical-history-header-top">
      <div className="clinical-history-patient">
        <div className="patient-avatar">
          {patient.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
        </div>
        <div style={{ minWidth: 0 }}>
          <Typography.Title level={4} style={{ margin: 0 }} className="clinical-history-patient-title">
            {patient.name}
          </Typography.Title>
          <div className="patient-meta">
            <span className="patient-meta-chip">{patient.documentType} {patient.documentNumber}</span>
            <span className="patient-meta-chip"><CalendarOutlined /> {calculateAge(patient.birthDate)}</span>
            <span className="patient-meta-chip"><UserOutlined /> {patient.sex}</span>
            <span className="patient-meta-chip">{patient.birthDate}</span>
          </div>
        </div>
      </div>
      <div className="clinical-history-actions">
        {!hideSave && (
          <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>Guardar</Button>
        )}
        <Button icon={<PrinterOutlined />}>Imprimir</Button>
        <Button danger icon={<FileDoneOutlined />}>Cerrar</Button>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
      </div>
    </div>
    <div className="clinical-history-summary">
      <div className="summary-cell">
        <div className="summary-cell-label">Fecha de ingreso</div>
        <div className="summary-cell-value">{patient.admissionDate}</div>
      </div>
      <div className="summary-cell">
        <div className="summary-cell-label">Servicio</div>
        <div className="summary-cell-value">{patient.careScope}</div>
      </div>
      <div className="summary-cell">
        <div className="summary-cell-label">Médico tratante</div>
        <div className="summary-cell-value">{currentDoctor}</div>
      </div>
      <div className="summary-cell">
        <div className="summary-cell-label">Estado</div>
        <div className="summary-cell-value">
          <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
        </div>
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────
// Minor Procedures page
// ─────────────────────────────────────────────────────────────
export const MinorProceduresContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <MinorProceduresSection
            admissionId={admissionId}
            currentDoctor={currentDoctor}
            patientName={patient.name}
            messageApi={messageApi}
          />
        </div>
      </div>
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Medical Note page
// ─────────────────────────────────────────────────────────────
export const MedicalNoteContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <MedicalNotesSection
            admissionId={admissionId}
            currentDoctor={currentDoctor}
            patientName={patient.name}
            messageApi={messageApi}
          />
        </div>
      </div>
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Non-Surgical Procedures page
// ─────────────────────────────────────────────────────────────
export const NonSurgicalProceduresContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const admissionId = searchParams.get("admissionId") || undefined
  const [consulta, setConsulta] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const createProcedimientoNoQx = useCreateProcedimientoNoQx()

  const resetForm = () => setConsulta("")

  const handleSave = async () => {
    if (!consulta.trim()) { messageApi.error("El campo es obligatorio."); return }
    if (!admissionId) { messageApi.error("No se encontró la admisión asociada a este procedimiento."); return }

    try {
      await createProcedimientoNoQx.mutateAsync({
        admissionId: Number(admissionId),
        descripcion: consulta.trim(),
      })
      messageApi.success(`Procedimiento no quirúrgico guardado para ${patient.name}.`)
      resetForm()
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "No se pudo guardar el procedimiento no quirúrgico.")
    }
  }

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={handleSave} />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <div className="evolution-tab-content evolution-tab-content--full">
            <div className="qx-form-header">
              <AuditOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
              <Typography.Title level={5} style={{ margin: 0 }}>Nuevo Procedimiento No Quirúrgico</Typography.Title>
              <div className="evo-header-meta">
                <span>{currentDoctor}</span>
                <span className="evo-header-sep">·</span>
                <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
            </div>
            <div className="qx-section">
              <label style={labelStyle}>Procedimiento no quirúrgico <span className="field-required">*</span></label>
              <TextArea
                rows={14} value={consulta} onChange={(e) => setConsulta(e.target.value)}
                placeholder="Describa el procedimiento no quirúrgico, evaluación, justificación, técnica utilizada e indicaciones de seguimiento..."
                maxLength={10000} showCount
              />
            </div>
            <div className="clinical-history-footer-actions">
              <Button onClick={resetForm}>Limpiar formulario</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={createProcedimientoNoQx.isPending}
                onClick={handleSave}
              >
                Guardar procedimiento no quirúrgico
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ClinicalRecordHistoryTrigger
        moduleType="non-surgical-procedures"
        onClick={() => setHistoryOpen(true)}
      />
      <ClinicalRecordHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        moduleType="non-surgical-procedures"
        admissionId={admissionId}
      />
    </Container>
  )
}

// ─────────────────────────────────────────────────────────────
// Specialist Evolution page
// ─────────────────────────────────────────────────────────────
export const SpecialistEvolutionContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()

  const patient = {
    name: searchParams.get("patientName") || "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber: searchParams.get("documentNumber") || "1102796382",
    careScope: searchParams.get("careScope") || "Urgencias",
    admissionDate: formatDate(searchParams.get("admissionDate")),
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <SpecialistEvolutionSection
            admissionId={admissionId}
            currentDoctor={currentDoctor}
            patientName={patient.name}
            messageApi={messageApi}
          />
        </div>
      </div>
    </Container>
  )
}
