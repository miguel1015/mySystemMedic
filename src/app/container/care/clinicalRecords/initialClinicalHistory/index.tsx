"use client"

import { Container } from "@/components/container"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { GetUser } from "@/core/interfaces/user/users"
import type { Dayjs } from "dayjs"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PrinterOutlined,
  RightOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useRouter, useSearchParams } from "next/navigation"
import { CSSProperties, useEffect, useMemo, useState } from "react"
import "./initialClinicalHistory.css"

const { TextArea } = Input

type DiagnosisType = "Principal" | "Relacionado" | "Secundario"

interface DiagnosisRow {
  id: number
  code: string
  diagnosis: string
  type: DiagnosisType
  main: boolean
  required: boolean
}

interface SidebarRecord {
  key: string
  title: string
  date: string
  count: number
  active: boolean
}

interface QxSearchItem {
  code: string
  description: string
}

const cie10Options = [
  { value: "S202", label: "S202 - Contusion del torax", diagnosis: "Contusion del torax" },
  { value: "S301", label: "S301 - Contusion de la pared abdominal", diagnosis: "Contusion de la pared abdominal" },
  { value: "S819", label: "S819 - Herida de la pierna, parte no especificada", diagnosis: "Herida de la pierna, parte no especificada" },
  { value: "R509", label: "R509 - Fiebre no especificada", diagnosis: "Fiebre no especificada" },
  { value: "I10X", label: "I10X - Hipertension esencial", diagnosis: "Hipertension esencial" },
  { value: "E119", label: "E119 - Diabetes mellitus tipo 2 sin complicaciones", diagnosis: "Diabetes mellitus tipo 2 sin complicaciones" },
]

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

const anesthesiaTypeOptions = [
  { value: "general", label: "Anestesia general" },
  { value: "regional", label: "Anestesia regional" },
  { value: "local", label: "Anestesia local" },
  { value: "sedacion", label: "Sedación" },
  { value: "epidural", label: "Epidural" },
  { value: "raquianestesia", label: "Raquianestesia" },
  { value: "combinada", label: "Combinada (general + regional)" },
]

const physicalExamSections = [
  "Cabeza y cuello", "Torax", "Abdomen", "Extremidades",
  "Sistema nervioso", "Organos de los sentidos", "Genitourinario",
]

const clinicalTabs = [
  { key: "subjective", label: "1. Subjetivo" },
  { key: "objective", label: "2. Objetivo" },
  { key: "analysis", label: "3. Análisis" },
  { key: "diagnoses", label: "4. Diagnósticos" },
  { key: "plan", label: "5. Plan" },
]

const sidebarRecords: SidebarRecord[] = [
  { key: "hci", title: "Historia Clínica Inicial", date: "03/03/2026 20:47", count: 0, active: false },
  { key: "quirurgica", title: "Descripción Quirúrgica", date: "", count: 0, active: false },
  { key: "evoluciones", title: "Evoluciones", date: "", count: 3, active: false },
  { key: "egreso", title: "Nota de Egreso", date: "", count: 0, active: false },
  { key: "enfermeria", title: "Notas de Enfermería", date: "", count: 2, active: false },
  { key: "menores", title: "Procedimientos Menores", date: "", count: 0, active: false },
  { key: "medicas", title: "Notas Médicas", date: "", count: 1, active: false },
  { key: "diagnosticos", title: "Procedimientos Diagnósticos", date: "", count: 0, active: false },
  { key: "noquirurgicos", title: "Procedimientos No Quirúrgicos", date: "", count: 0, active: false },
]

const defaultDiagnoses: DiagnosisRow[] = [
  { id: 1, code: "S202", diagnosis: "Contusion del torax", type: "Principal", main: true, required: true },
  { id: 2, code: "S301", diagnosis: "Contusion de la pared abdominal", type: "Relacionado", main: false, required: false },
  { id: 3, code: "S819", diagnosis: "Herida de la pierna, parte no especificada", type: "Relacionado", main: false, required: false },
]

const defaultEvoVitals = {
  ta: "120/80", fc: 80, fr: 18,
  temperature: 36.5, saturation: 98,
  weight: 80, height: 175,
}

const labelStyle: CSSProperties = {
  display: "block",
  color: "var(--dash-text-secondary, #6b7280)",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
}

const sectionCardStyle: CSSProperties = {
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 8,
  background: "var(--dash-surface, #ffffff)",
  padding: 16,
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
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return `${age} años`
}

const InitialClinicalHistoryContainer = () => {
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
    clinicalRecord: searchParams.get("clinicalRecord") || `HC-${searchParams.get("patientId") || "1024"}`,
    room: searchParams.get("room") || "Observacion 4",
    insurer: searchParams.get("insurer") || "EPS Sanitas",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const canAssignDoctor = useMemo(() => {
    const role = (me?.role || "").toLowerCase()
    return ["admin", "administrador", "coordinador", "jefe"].some((word) => role.includes(word))
  }, [me?.role])

  const doctorOptions = useMemo(() => {
    const mapped = users.map((user) => ({
      value: user.id,
      label: buildFullName(user),
      role: user.userRoleName,
    }))
    if (mapped.length) return mapped
    return [{ value: me?.id || 0, label: currentDoctor, role: me?.role || "Medico" }]
  }, [currentDoctor, me?.id, me?.role, users])

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(doctorOptions[0]?.value)
  const [vitals, setVitals] = useState({
    ta: "120/80", fc: 80, fr: 18,
    temperature: 36.5, saturation: 98,
    glasgow: 15, weight: 80, height: 175,
  })
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>(defaultDiagnoses)
  const [activeSidebarKey, setActiveSidebarKey] = useState("hci")
  const [activeSection, setActiveSection] = useState("subjective")

  // ── Evoluciones state ──
  const [evoMotivo, setEvoMotivo] = useState("")
  const [evoPlan, setEvoPlan] = useState("")
  const [evoVitals, setEvoVitals] = useState({ ...defaultEvoVitals })

  // ── Surgical description state ──
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

  const bmi = useMemo(() => {
    const h = vitals.height / 100
    if (!h || !vitals.weight) return ""
    return (vitals.weight / (h * h)).toFixed(1)
  }, [vitals.height, vitals.weight])

  const evoBmi = useMemo(() => {
    const h = evoVitals.height / 100
    if (!h || !evoVitals.weight) return ""
    return (evoVitals.weight / (h * h)).toFixed(1)
  }, [evoVitals.height, evoVitals.weight])

  const mainDiagnosis = useMemo(() => diagnoses.find((d) => d.main && d.code), [diagnoses])
  const selectedDoctor = doctorOptions.find((d) => d.value === selectedDoctorId)?.label || currentDoctor

  useEffect(() => {
    if (!doctorOptions.length) return
    if (selectedDoctorId === undefined || !doctorOptions.some((d) => d.value === selectedDoctorId)) {
      setSelectedDoctorId(doctorOptions[0].value)
    }
  }, [doctorOptions, selectedDoctorId])

  const updateDiagnosis = (id: number, patch: Partial<DiagnosisRow>) => {
    setDiagnoses((items) =>
      items.map((item) => {
        if (item.id !== id) return patch.main ? { ...item, main: false } : item
        return { ...item, ...patch }
      }),
    )
  }

  const addDiagnosis = () => {
    setDiagnoses((items) => [
      ...items,
      { id: Date.now(), code: "", diagnosis: "", type: "Secundario", main: false, required: false },
    ])
  }

  const removeDiagnosis = (id: number) => {
    setDiagnoses((items) => items.filter((item) => item.id !== id))
  }

  // ── Surgical description helpers ──
  const addQxProcedure = () => {
    if (qxProcedures.length >= 4) return
    setQxProcedures((prev) => [...prev, { code: "", description: "" }])
  }

  const removeQxProcedure = (idx: number) => {
    setQxProcedures((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateQxProcedure = (idx: number, patch: Partial<QxSearchItem>) => {
    setQxProcedures((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  const addQxDiagnosis = () => {
    if (qxDiagnoses.length >= 4) return
    setQxDiagnoses((prev) => [...prev, { code: "", description: "" }])
  }

  const removeQxDiagnosis = (idx: number) => {
    setQxDiagnoses((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateQxDiagnosis = (idx: number, patch: Partial<QxSearchItem>) => {
    setQxDiagnoses((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  const resetQxForm = () => {
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

  const resetEvoForm = () => {
    setEvoMotivo("")
    setEvoPlan("")
    setEvoVitals({ ...defaultEvoVitals })
  }

  const validateAndSaveEvo = () => {
    const motivo = evoMotivo.trim()
    if (!motivo || motivo.length < 10) {
      messageApi.error("El motivo de consulta debe tener mínimo 10 caracteres.")
      return
    }
    if (!evoPlan.trim()) {
      messageApi.error("El campo Plan es obligatorio.")
      return
    }
    messageApi.success(`Evolución guardada para ${patient.name}.`)
  }

  const validateAndSaveQx = () => {
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

  const validateAndSave = () => {
    const hasMain = diagnoses.some((item) => item.main && item.code && item.diagnosis)
    const hasEmpty = diagnoses.some((item) => !item.code || !item.diagnosis)
    if (!hasMain) { messageApi.error("Debe registrar un diagnóstico principal."); return }
    if (hasEmpty) { messageApi.warning("Complete o elimine los diagnósticos incompletos."); return }
    messageApi.success(`Historia clínica guardada para ${patient.name}.`)
  }

  const diagnosisColumns: ColumnsType<DiagnosisRow> = [
    {
      title: "Código CIE10", dataIndex: "code", width: 190,
      render: (_v, record) => (
        <Select showSearch placeholder="Buscar CIE10" value={record.code || undefined}
          options={cie10Options} style={{ width: "100%" }}
          onChange={(value) => {
            const selected = cie10Options.find((o) => o.value === value)
            updateDiagnosis(record.id, { code: value, diagnosis: selected?.diagnosis || "" })
          }}
        />
      ),
    },
    {
      title: "Tipo", dataIndex: "type", width: 160,
      render: (_v, record) => (
        <Select value={record.type} style={{ width: "100%" }}
          options={[
            { value: "Principal", label: "Principal" },
            { value: "Relacionado", label: "Relacionado" },
            { value: "Secundario", label: "Secundario" },
          ]}
          onChange={(value) => updateDiagnosis(record.id, { type: value })}
        />
      ),
    },
    {
      title: "Principal", dataIndex: "main", width: 105, align: "center",
      render: (_v, record) => (
        <Checkbox checked={record.main} onChange={(e) => updateDiagnosis(record.id, { main: e.target.checked })} />
      ),
    },
    {
      title: "Obligatorio", dataIndex: "required", width: 115, align: "center",
      render: (_v, record) => (
        <Tag color={record.required || record.main ? "blue" : "default"}>
          {record.required || record.main ? "Sí" : "Opcional"}
        </Tag>
      ),
    },
    {
      title: "", width: 64, align: "center",
      render: (_v, record) => (
        <Tooltip title="Eliminar">
          <Button icon={<DeleteOutlined />} danger type="text" onClick={() => removeDiagnosis(record.id)} />
        </Tooltip>
      ),
    },
  ]

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
              <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>
                Guardar
              </Button>
              <Button icon={<EyeOutlined />}>Vista previa</Button>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar Historia</Button>
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
              <div className="summary-cell-value">
                {canAssignDoctor ? (
                  <Select showSearch value={selectedDoctorId} options={doctorOptions}
                    onChange={setSelectedDoctorId}
                    style={{ width: "100%", marginTop: 2 }} size="small" />
                ) : (
                  selectedDoctor
                )}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Diagnóstico principal</div>
              <div className="summary-cell-value">
                {mainDiagnosis ? (
                  <Tag color="blue" style={{ whiteSpace: "normal", margin: 0 }}>
                    {mainDiagnosis.code} – {mainDiagnosis.diagnosis}
                  </Tag>
                ) : (
                  <span style={{ color: "var(--dash-text-tertiary, #93a39d)", fontSize: 12 }}>Sin diagnóstico</span>
                )}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>Hospitalizado</Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ WORKSPACE ════ */}
        <div className="evolution-workspace">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="clinical-sidebar">
            <div className="clinical-sidebar-header">
              <FileTextOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 14 }} />
              Historia clínica
            </div>

            <div className="clinical-sidebar-search">
              <Input
                prefix={<SearchOutlined style={{ color: "var(--dash-text-tertiary, #93a39d)" }} />}
                placeholder="Buscar en la historia clínica..."
                allowClear
                size="small"
              />
            </div>

            <div className="sidebar-nav-list">
              {sidebarRecords.map((record) => {
                const isClickable = ["hci", "quirurgica", "evoluciones"].includes(record.key)
                return (
                  <button
                    key={record.key}
                    type="button"
                    className={`sidebar-record-item${activeSidebarKey === record.key ? " active" : ""}${!isClickable ? " sidebar-record-disabled" : ""}`}
                    onClick={() => { if (isClickable) setActiveSidebarKey(record.key) }}
                  >
                    <div className="sidebar-record-icon">
                      <FileTextOutlined />
                    </div>
                    <div className="sidebar-record-content">
                      <div className="sidebar-record-title">{record.title}</div>
                      {record.date && (
                        <div className="sidebar-record-date">{record.date}</div>
                      )}
                    </div>
                    {record.count > 0 && (
                      <Tag color="blue" style={{ margin: 0, flexShrink: 0, fontSize: 10 }}>
                        {record.count}
                      </Tag>
                    )}
                    <RightOutlined className="sidebar-record-chevron" />
                  </button>
                )
              })}
            </div>
          </aside>

          {/* ── RIGHT AREA ── */}
          <div className="evolution-right">

            {/* Historia Clínica Inicial: 5 tabs */}
            {activeSidebarKey === "hci" && (
              <>
                <nav className="clinical-section-tabs" aria-label="Secciones de historia clínica">
                  {clinicalTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={activeSection === tab.key ? "active" : ""}
                      onClick={() => setActiveSection(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <div className="evolution-tab-content">

                  {/* 1. Subjetivo */}
                  {activeSection === "subjective" && (
                    <div className="tab-section-inner">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>1. Subjetivo (SOAP)</Typography.Title>
                      <div className="subjective-grid">
                        <div>
                          <label style={labelStyle}>Motivo de consulta</label>
                          <Input defaultValue="Me accidenté" />
                        </div>
                        <div>
                          <label style={labelStyle}>Revisión por sistemas</label>
                          <Input defaultValue="Lo referido en enfermedad actual" />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Enfermedad actual</label>
                          <TextArea rows={4} defaultValue="Paciente masculino de 21 años de edad, víctima de accidente de tránsito el día de ayer. Refiere dolor torácico y abdominal posterior al evento." />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Objetivo */}
                  {activeSection === "objective" && (
                    <div className="tab-section-inner">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>2. Objetivo</Typography.Title>
                      <div className="evolution-objective-grid">
                        <div style={sectionCardStyle}>
                          <Typography.Text strong>Examen físico</Typography.Text>
                          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                            {physicalExamSections.map((section) => (
                              <div className="physical-exam-row" key={section}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text-secondary, #344054)" }}>{section}</span>
                                <Input size="small" defaultValue={section === "Abdomen" ? "Blando, depresible, dolor a la palpación" : "Sin alteraciones aparentes"} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={sectionCardStyle}>
                          <Typography.Text strong>Signos vitales</Typography.Text>
                          <div className="vital-signs-grid">
                            {[
                              { label: "TA", key: "ta", isString: true },
                              { label: "FC", key: "fc" },
                              { label: "FR", key: "fr" },
                              { label: "Temp.", key: "temperature" },
                              { label: "Sat. O₂", key: "saturation" },
                              { label: "Glasgow", key: "glasgow" },
                              { label: "Peso kg", key: "weight" },
                              { label: "Talla cm", key: "height" },
                            ].map(({ label, key, isString }) => (
                              <div key={key}>
                                <label style={labelStyle}>{label}</label>
                                {isString ? (
                                  <Input value={(vitals as Record<string, number | string>)[key] as string}
                                    onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })} />
                                ) : (
                                  <InputNumber style={{ width: "100%" }}
                                    value={(vitals as Record<string, number | string>)[key] as number}
                                    onChange={(v) => setVitals({ ...vitals, [key]: Number(v) || 0 })} />
                                )}
                              </div>
                            ))}
                            <div>
                              <label style={labelStyle}>IMC</label>
                              <Input value={bmi ? `${bmi} kg/m²` : ""} readOnly />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Análisis */}
                  {activeSection === "analysis" && (
                    <div className="tab-section-inner">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>3. Análisis</Typography.Title>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <Button size="small">B</Button>
                        <Button size="small">I</Button>
                        <Button size="small">Lista</Button>
                        <Button size="small">Plantilla</Button>
                      </div>
                      <TextArea rows={8} defaultValue="Paciente con trauma cerrado de tórax y abdomen posterior a accidente de tránsito, con contusión torácica y dolor abdominal secundario. Hemodinámicamente estable, sin compromiso neurológico." />
                    </div>
                  )}

                  {/* 4. Diagnósticos */}
                  {activeSection === "diagnoses" && (
                    <div className="tab-section-inner">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                        <Typography.Title level={5} style={{ margin: 0 }}>4. Diagnósticos (CIE-10)</Typography.Title>
                        <Button type="primary" ghost icon={<PlusOutlined />} onClick={addDiagnosis}>Agregar diagnóstico</Button>
                      </div>
                      <div className="diagnosis-table-wrap">
                        <Table<DiagnosisRow>
                          columns={diagnosisColumns} dataSource={diagnoses}
                          rowKey="id" pagination={false} scroll={{ x: 760 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Plan */}
                  {activeSection === "plan" && (
                    <div className="tab-section-inner">
                      <Typography.Title level={5} style={{ marginTop: 0 }}>5. Plan</Typography.Title>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <Button size="small">B</Button>
                        <Button size="small">I</Button>
                        <Button size="small">Lista</Button>
                        <Button size="small">Plantilla</Button>
                      </div>
                      <TextArea rows={8} placeholder="Describa el plan de manejo terapéutico, indicaciones, medicamentos y seguimiento..." />
                    </div>
                  )}

                  <div className="clinical-history-footer-actions">
                    <Button>Limpiar formulario</Button>
                    <Button type="primary" icon={<MedicineBoxOutlined />} onClick={validateAndSave}>
                      Guardar
                    </Button>
                  </div>

                </div>
              </>
            )}

            {/* Descripción Quirúrgica */}
            {activeSidebarKey === "quirurgica" && (
              <div className="evolution-tab-content evolution-tab-content--full">
                <div className="qx-description-form">
                  <div className="qx-form-header">
                    <MedicineBoxOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
                    <Typography.Title level={5} style={{ margin: 0 }}>Descripción Quirúrgica</Typography.Title>
                  </div>

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
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" value={qxStartDate} onChange={setQxStartDate}
                          style={{ width: "100%" }} placeholder="Seleccione fecha y hora" />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          Fecha final de ejecución <span className="field-required">*</span>
                        </label>
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" value={qxEndDate} onChange={setQxEndDate}
                          style={{ width: "100%" }} placeholder="Seleccione fecha y hora"
                          disabledDate={(current) =>
                            qxStartDate ? current && current.isBefore(qxStartDate.startOf("day")) : false
                          }
                        />
                        {qxStartDate && qxEndDate && qxEndDate.isBefore(qxStartDate) && (
                          <span className="qx-field-error">La fecha final no puede ser menor que la fecha inicial.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="qx-section">
                    <div className="qx-section-header">
                      <span className="section-number">2</span>
                      <span className="section-title">Equipo quirúrgico</span>
                    </div>
                    <div className="qx-grid-2">
                      <div>
                        <label style={labelStyle}>Cirujano <span className="field-required">*</span></label>
                        <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione cirujano"
                          value={qxSurgeon} options={doctorOptions} onChange={setQxSurgeon} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Anestesiólogo <span className="field-required">*</span></label>
                        <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione anestesiólogo"
                          value={qxAnesthesiologist} options={doctorOptions} onChange={setQxAnesthesiologist} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Instrumentador <span className="field-required">*</span></label>
                        <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione instrumentador"
                          value={qxInstrumenter} options={doctorOptions} onChange={setQxInstrumenter} style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Ayudante Qx <span className="field-required">*</span></label>
                        <Select showSearch={{ optionFilterProp: "label" }} placeholder="Seleccione ayudante quirúrgico"
                          value={qxAssistant} options={doctorOptions} onChange={setQxAssistant} style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="qx-section">
                    <div className="qx-section-header">
                      <span className="section-number">3</span>
                      <span className="section-title">Tipo de anestesia</span>
                    </div>
                    <div className="qx-field-narrow">
                      <label style={labelStyle}>Tipo de anestesia <span className="field-required">*</span></label>
                      <Select placeholder="Seleccione tipo de anestesia" value={qxAnesthesiaType}
                        options={anesthesiaTypeOptions} onChange={setQxAnesthesiaType} style={{ width: "100%" }} />
                    </div>
                  </div>

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
                            <Select showSearch={{ optionFilterProp: "label" }}
                              placeholder="Buscar por código CUPS/SOAT o descripción"
                              value={proc.code || undefined} options={cupsOptions}
                              style={{ flex: "1 1 220px", minWidth: 0 }}
                              onChange={(value) => {
                                const found = cupsOptions.find((o) => o.value === value)
                                updateQxProcedure(idx, { code: value, description: found?.description || "" })
                              }}
                            />
                            <Input placeholder="Descripción del procedimiento" value={proc.description}
                              onChange={(e) => updateQxProcedure(idx, { description: e.target.value })}
                              style={{ flex: "1 1 200px", minWidth: 0 }} />
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
                            <Select showSearch={{ optionFilterProp: "label" }}
                              placeholder="Buscar por código CIE-10 o descripción"
                              value={diag.code || undefined} options={cie10Options}
                              style={{ flex: "1 1 220px", minWidth: 0 }}
                              onChange={(value) => {
                                const found = cie10Options.find((o) => o.value === value)
                                updateQxDiagnosis(idx, { code: value, description: found?.diagnosis || "" })
                              }}
                            />
                            <Input placeholder="Descripción del diagnóstico" value={diag.description}
                              onChange={(e) => updateQxDiagnosis(idx, { description: e.target.value })}
                              style={{ flex: "1 1 200px", minWidth: 0 }} />
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

                  <div className="qx-section">
                    <div className="qx-section-header">
                      <span className="section-number">6</span>
                      <span className="section-title">Descripción del procedimiento</span>
                    </div>
                    <label className="field-label">
                      Descripción del procedimiento <span className="field-required">*</span>
                    </label>
                    <TextArea rows={8} value={qxProcedureDescription}
                      onChange={(e) => setQxProcedureDescription(e.target.value)}
                      placeholder="Describa de forma detallada el acto quirúrgico realizado, hallazgos intraoperatorios, técnica empleada y demás consideraciones clínicas relevantes..."
                      maxLength={10000}
                    />
                    <div className="char-count-row">{qxProcedureDescription.length} / 10000</div>
                  </div>
                </div>

                <div className="clinical-history-footer-actions">
                  <Button onClick={resetQxForm}>Limpiar formulario</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSaveQx}>
                    Guardar descripción quirúrgica
                  </Button>
                </div>
              </div>
            )}

            {/* Evoluciones */}
            {activeSidebarKey === "evoluciones" && (
              <div className="evolution-tab-content evolution-tab-content--full">

                {/* Header */}
                <div className="qx-form-header">
                  <HeartOutlined style={{ color: "var(--theme-primary, #0f6f5c)", fontSize: 18 }} />
                  <Typography.Title level={5} style={{ margin: 0 }}>Nueva Evolución</Typography.Title>
                  <div className="evo-header-meta">
                    <span>{selectedDoctor}</span>
                    <span className="evo-header-sep">·</span>
                    <span>{new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Sección 1: Motivo de consulta */}
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

                {/* Sección 2: Signos vitales */}
                <div className="qx-section">
                  <div className="qx-section-header" style={{ flexWrap: "wrap", gap: 8 }}>
                    <span className="section-number">2</span>
                    <span className="section-title">Signos vitales</span>
                    <Tag color="blue" style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600 }}>
                      Cargados desde último Triage
                    </Tag>
                  </div>
                  <div className="evo-vitals-grid">
                    {([
                      { label: "TA (mmHg)", key: "ta", isString: true, placeholder: "120/80" },
                      { label: "FC (lpm)", key: "fc", placeholder: "80" },
                      { label: "FR (rpm)", key: "fr", placeholder: "18" },
                      { label: "Temperatura (°C)", key: "temperature", placeholder: "36.5" },
                      { label: "Sat. O₂ (%)", key: "saturation", placeholder: "98" },
                      { label: "Peso (kg)", key: "weight", placeholder: "80" },
                      { label: "Talla (cm)", key: "height", placeholder: "175" },
                    ] as Array<{ label: string; key: string; isString?: boolean; placeholder: string }>).map(({ label, key, isString, placeholder }) => (
                      <div key={key} className="evo-vital-item">
                        <label style={labelStyle}>{label}</label>
                        {isString ? (
                          <Input
                            value={(evoVitals as Record<string, number | string>)[key] as string}
                            placeholder={placeholder}
                            onChange={(e) => setEvoVitals({ ...evoVitals, [key]: e.target.value })}
                          />
                        ) : (
                          <InputNumber
                            style={{ width: "100%" }}
                            value={(evoVitals as Record<string, number | string>)[key] as number}
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

                {/* Sección 3: Plan */}
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
                  <Button onClick={resetEvoForm}>Limpiar formulario</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSaveEvo}>
                    Guardar evolución
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Container>
  )
}

export default InitialClinicalHistoryContainer
