"use client"

import { Container } from "@/components/container"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { GetUser } from "@/core/interfaces/user/users"
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import {
  Button,
  Checkbox,
  Divider,
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

interface PlanItem {
  key: string
  title: string
  description: string
  icon: string
  count: number
}

const cie10Options = [
  { value: "S202", label: "S202 - Contusion del torax", diagnosis: "Contusion del torax" },
  { value: "S301", label: "S301 - Contusion de la pared abdominal", diagnosis: "Contusion de la pared abdominal" },
  { value: "S819", label: "S819 - Herida de la pierna, parte no especificada", diagnosis: "Herida de la pierna, parte no especificada" },
  { value: "R509", label: "R509 - Fiebre no especificada", diagnosis: "Fiebre no especificada" },
  { value: "I10X", label: "I10X - Hipertension esencial", diagnosis: "Hipertension esencial" },
  { value: "E119", label: "E119 - Diabetes mellitus tipo 2 sin complicaciones", diagnosis: "Diabetes mellitus tipo 2 sin complicaciones" },
]

const physicalExamSections = [
  "Cabeza y cuello",
  "Torax",
  "Abdomen",
  "Extremidades",
  "Sistema nervioso",
  "Organos de los sentidos",
  "Genitourinario",
]

const planItems: PlanItem[] = [
  { key: "medicines", title: "Medicamentos", description: "Ordenes y formulacion", icon: "Rx", count: 2 },
  { key: "procedures", title: "Procedimientos", description: "Procedimientos programados", icon: "PR", count: 1 },
  { key: "labs", title: "Laboratorios", description: "Solicitudes de laboratorio", icon: "LB", count: 3 },
  { key: "images", title: "Imagenes diagnosticas", description: "Estudios radiologicos", icon: "ID", count: 1 },
  { key: "consults", title: "Interconsultas", description: "Valoraciones especializadas", icon: "IC", count: 1 },
  { key: "recommendations", title: "Recomendaciones", description: "Cuidados y recomendaciones", icon: "RC", count: 0 },
]

const clinicalTabs = [
  { key: "subjective", label: "1. Subjetivo" },
  { key: "objective", label: "2. Objetivo" },
  { key: "analysis", label: "3. Analisis" },
  { key: "diagnoses", label: "4. Diagnosticos" },
  { key: "plan", label: "5. Plan" },
]

const defaultDiagnoses: DiagnosisRow[] = [
  { id: 1, code: "S202", diagnosis: "Contusion del torax", type: "Principal", main: true, required: true },
  { id: 2, code: "S301", diagnosis: "Contusion de la pared abdominal", type: "Relacionado", main: false, required: false },
  { id: 3, code: "S819", diagnosis: "Herida de la pierna, parte no especificada", type: "Relacionado", main: false, required: false },
]

const cardStyle: CSSProperties = {
  border: "1px solid var(--dash-border, #e5e7eb)",
  borderRadius: 8,
  background: "var(--dash-surface, #ffffff)",
}

const sectionStyle: CSSProperties = {
  ...cardStyle,
  padding: 18,
}

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
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return "21 anos"
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return `${age} anos`
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
    ta: "120/80",
    fc: 91,
    fr: 20,
    temperature: 36.7,
    saturation: 97,
    glasgow: 15,
    weight: 85,
    height: 174,
  })
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>(defaultDiagnoses)
  const [activeSection, setActiveSection] = useState("subjective")

  const bmi = useMemo(() => {
    const heightMeters = vitals.height / 100
    if (!heightMeters || !vitals.weight) return ""
    return (vitals.weight / (heightMeters * heightMeters)).toFixed(1)
  }, [vitals.height, vitals.weight])

  const selectedDoctor = doctorOptions.find((doctor) => doctor.value === selectedDoctorId)?.label || currentDoctor

  useEffect(() => {
    if (!doctorOptions.length) return
    if (selectedDoctorId === undefined || !doctorOptions.some((doctor) => doctor.value === selectedDoctorId)) {
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
      {
        id: Date.now(),
        code: "",
        diagnosis: "",
        type: "Secundario",
        main: false,
        required: false,
      },
    ])
  }

  const removeDiagnosis = (id: number) => {
    setDiagnoses((items) => items.filter((item) => item.id !== id))
  }

  const validateAndSave = () => {
    const hasMain = diagnoses.some((item) => item.main && item.code && item.diagnosis)
    const hasEmpty = diagnoses.some((item) => !item.code || !item.diagnosis)

    if (!hasMain) {
      messageApi.error("Debe registrar un diagnostico principal.")
      return
    }

    if (hasEmpty) {
      messageApi.warning("Complete o elimine los diagnosticos incompletos.")
      return
    }

    messageApi.success(`Evolucion guardada para ${patient.name} con medico ${selectedDoctor}.`)
  }

  const diagnosisColumns: ColumnsType<DiagnosisRow> = [
    {
      title: "Codigo CIE10",
      dataIndex: "code",
      width: 190,
      render: (_value, record) => (
        <Select
          showSearch
          placeholder="Buscar CIE10"
          value={record.code || undefined}
          optionFilterProp="label"
          options={cie10Options}
          style={{ width: "100%" }}
          onChange={(value) => {
            const selected = cie10Options.find((option) => option.value === value)
            updateDiagnosis(record.id, {
              code: value,
              diagnosis: selected?.diagnosis || "",
            })
          }}
        />
      ),
    },
    {
      title: "Diagnostico",
      dataIndex: "diagnosis",
      render: (_value, record) => (
        <Input
          value={record.diagnosis}
          placeholder="Descripcion diagnostica"
          onChange={(event) => updateDiagnosis(record.id, { diagnosis: event.target.value })}
        />
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 160,
      render: (_value, record) => (
        <Select
          value={record.type}
          options={[
            { value: "Principal", label: "Principal" },
            { value: "Relacionado", label: "Relacionado" },
            { value: "Secundario", label: "Secundario" },
          ]}
          style={{ width: "100%" }}
          onChange={(value) => updateDiagnosis(record.id, { type: value })}
        />
      ),
    },
    {
      title: "Principal",
      dataIndex: "main",
      width: 105,
      align: "center",
      render: (_value, record) => (
        <Checkbox checked={record.main} onChange={(event) => updateDiagnosis(record.id, { main: event.target.checked })} />
      ),
    },
    {
      title: "Obligatorio",
      dataIndex: "required",
      width: 115,
      align: "center",
      render: (_value, record) => (
        <Tag color={record.required || record.main ? "blue" : "default"}>
          {record.required || record.main ? "Si" : "Opcional"}
        </Tag>
      ),
    },
    {
      title: "",
      width: 64,
      align: "center",
      render: (_value, record) => (
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
        <div
          className="clinical-history-header"
          style={{
            ...cardStyle,
            position: "sticky",
            top: 0,
            zIndex: 20,
            overflow: "hidden",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div className="clinical-history-header-top">
            <div className="clinical-history-patient">
              <div
                style={{
                  width: 48,
                  minWidth: 48,
                  height: 48,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #0F6F5C, #1677ff)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {patient.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
              </div>
              <div style={{ minWidth: 0 }}>
                <Typography.Title className="clinical-history-patient-title" level={4} style={{ margin: 0, color: "#111827" }}>
                  {patient.name}
                </Typography.Title>
                <div className="clinical-history-patient-meta">
                  <span>{patient.documentType} {patient.documentNumber}</span>
                  <span>{calculateAge(patient.birthDate)}</span>
                  <span>{patient.sex}</span>
                  <span>{patient.birthDate}</span>
                </div>
              </div>
            </div>
            <div className="clinical-history-actions">
              <Button type="primary" icon={<SaveOutlined />} onClick={validateAndSave}>Guardar evolucion</Button>
              <Button icon={<EyeOutlined />}>Vista previa</Button>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button danger icon={<FileDoneOutlined />}>Cerrar historia</Button>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <Divider style={{ margin: 0 }} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))",
              gap: 1,
              background: "var(--dash-border-subtle, #eef2f7)",
            }}
          >
            {[
              ["Servicio", patient.careScope],
              ["Fecha de ingreso", patient.admissionDate],
              ["Historia clinica", patient.clinicalRecord],
              ["Cama/Habitacion", patient.room],
              ["EPS/Aseguradora", patient.insurer],
            ].map(([label, value]) => (
              <div className="clinical-history-summary-item" key={label}>
                <div style={{ color: "var(--dash-text-secondary, #667085)", fontSize: 11, fontWeight: 700 }}>{label}</div>
                <div style={{ color: "var(--dash-text-primary, #172033)", fontSize: 13, fontWeight: 700, marginTop: 3 }}>{value}</div>
              </div>
            ))}
            <div className="clinical-history-summary-item">
              <div style={{ color: "var(--dash-text-secondary, #667085)", fontSize: 11, fontWeight: 700 }}>Medico tratante</div>
              {canAssignDoctor ? (
                <Select
                  showSearch
                  value={selectedDoctorId}
                  options={doctorOptions}
                  optionFilterProp="label"
                  onChange={setSelectedDoctorId}
                  style={{ width: "100%", marginTop: 4 }}
                />
              ) : (
                <div style={{ color: "var(--dash-text-primary, #172033)", fontSize: 13, fontWeight: 700, marginTop: 3 }}>{selectedDoctor}</div>
              )}
            </div>
          </div>
        </div>

        <div className="evolution-workspace">
          <section className="clinical-history-records">
            <div className="clinical-history-records-header">
              <Input prefix={<SearchOutlined />} placeholder="Buscar en la historia..." allowClear />
              <Button type="dashed" icon={<PlusOutlined />}>Nueva nota</Button>
            </div>
            <div className="clinical-history-records-list">
              {[
                ["Historia Clinica Inicial", "05/04/2026 20:47", 1],
                ["Descripcion quirurgica", "", 3],
                ["Nota de egreso", "", 0],
                ["Notas de enfermeria", "", 2],
                ["Procedimientos menores", "", 0],
                ["Notas medicas", "", 1],
                ["Procedimientos diagnosticos", "", 0],
              ].map(([title, detail, count]) => (
                <button
                  key={title}
                  className="clinical-history-record-card"
                >
                  <div className="history-nav-item-title">
                    <span style={{ fontWeight: 700, fontSize: 13 }}><FileTextOutlined /> {title}</span>
                    {Number(count) > 0 && <Tag color="blue">{count}</Tag>}
                  </div>
                  {detail && <div style={{ color: "var(--dash-text-secondary, #667085)", fontSize: 11, marginTop: 3 }}>{detail}</div>}
                </button>
              ))}
            </div>
          </section>

          <nav className="clinical-section-tabs" aria-label="Secciones de historia clinica">
            {clinicalTabs.map((tab) => (
              <button
                key={tab.key}
                className={activeSection === tab.key ? "active" : ""}
                onClick={() => setActiveSection(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <main className="evolution-main">
            {activeSection === "subjective" && <section id="subjective" style={sectionStyle}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>1. Subjetivo (SOAP)</Typography.Title>
              <div className="subjective-grid">
                <div>
                  <label style={labelStyle}>Motivo de consulta</label>
                  <Input defaultValue="Me accidente" />
                </div>
                <div>
                  <label style={labelStyle}>Revision por sistemas</label>
                  <Input defaultValue="Lo referido en enfermedad actual" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Enfermedad actual</label>
                  <TextArea
                    rows={4}
                    defaultValue="Paciente masculino de 21 anos de edad, victima de accidente de transito el dia de ayer. Refiere dolor toracico y abdominal posterior al evento."
                  />
                </div>
              </div>
            </section>}

            {activeSection === "objective" && <section id="objective" style={sectionStyle}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>2. Objetivo</Typography.Title>
              <div className="evolution-objective-grid">
                <div style={{ ...cardStyle, padding: 14 }}>
                  <Typography.Text strong>Examen fisico</Typography.Text>
                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    {physicalExamSections.map((section) => (
                      <div className="physical-exam-row" key={section}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dash-text-secondary, #344054)" }}>{section}</span>
                        <Input size="small" defaultValue={section === "Abdomen" ? "Blando, depresible, dolor a la palpacion" : "Sin alteraciones aparentes"} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ ...cardStyle, padding: 14 }}>
                  <Typography.Text strong>Signos vitales</Typography.Text>
                  <div className="vital-signs-grid">
                    <div><label style={labelStyle}>TA</label><Input value={vitals.ta} onChange={(e) => setVitals({ ...vitals, ta: e.target.value })} /></div>
                    <div><label style={labelStyle}>FC</label><InputNumber value={vitals.fc} onChange={(value) => setVitals({ ...vitals, fc: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>FR</label><InputNumber value={vitals.fr} onChange={(value) => setVitals({ ...vitals, fr: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>Temp.</label><InputNumber value={vitals.temperature} onChange={(value) => setVitals({ ...vitals, temperature: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>Sat. O2</label><InputNumber value={vitals.saturation} onChange={(value) => setVitals({ ...vitals, saturation: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>Glasgow</label><InputNumber value={vitals.glasgow} onChange={(value) => setVitals({ ...vitals, glasgow: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>Peso kg</label><InputNumber value={vitals.weight} onChange={(value) => setVitals({ ...vitals, weight: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>Talla cm</label><InputNumber value={vitals.height} onChange={(value) => setVitals({ ...vitals, height: Number(value) || 0 })} style={{ width: "100%" }} /></div>
                    <div><label style={labelStyle}>IMC</label><Input value={bmi ? `${bmi} kg/m2` : ""} readOnly /></div>
                  </div>
                </div>
              </div>
            </section>}

            {activeSection === "analysis" && <section id="analysis" style={sectionStyle}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>3. Analisis</Typography.Title>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Button size="small">B</Button>
                <Button size="small">I</Button>
                <Button size="small">Lista</Button>
                <Button size="small">Plantilla</Button>
              </div>
              <TextArea
                rows={8}
                defaultValue="Paciente con trauma cerrado de torax y abdomen posterior a accidente de transito, con contusion toracica y dolor abdominal secundario. Hemodinamicamente estable, sin compromiso neurologico. Se requiere manejo conservador, control del dolor y vigilancia de posibles complicaciones respiratorias y abdominales."
              />
            </section>}

            {activeSection === "diagnoses" && <section id="diagnoses" style={sectionStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>4. Diagnosticos (CIE-10)</Typography.Title>
                <Button type="primary" ghost icon={<PlusOutlined />} onClick={addDiagnosis}>Agregar diagnostico</Button>
              </div>
              <div className="diagnosis-table-wrap">
                <Table<DiagnosisRow>
                  columns={diagnosisColumns}
                  dataSource={diagnoses}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 760 }}
                />
              </div>
            </section>}

            {activeSection === "plan" && <section id="plan" style={sectionStyle}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>5. Plan</Typography.Title>
              <div style={{ display: "grid", gap: 10 }}>
                {planItems.map((item) => (
                  <div
                    className="plan-row"
                    key={item.key}
                    style={{
                      border: "1px solid var(--dash-border, #e5e7eb)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      alignItems: "center",
                      gap: 12,
                      background: "var(--dash-surface-2, #ffffff)",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(22, 119, 255, 0.12)", color: "#1677ff", display: "grid", placeItems: "center", fontWeight: 800 }}>
                      {item.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "var(--dash-text-primary, #172033)" }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: "var(--dash-text-secondary, #667085)" }}>{item.count} {item.description.toLowerCase()}</div>
                    </div>
                    <Button icon={<PlusOutlined />}>Agregar</Button>
                  </div>
                ))}
              </div>
            </section>}

            <div className="clinical-history-footer-actions">
              <Button>Limpiar formulario</Button>
              <Button type="primary" icon={<MedicineBoxOutlined />} onClick={validateAndSave}>Guardar evolucion</Button>
            </div>
          </main>
        </div>
      </div>
    </Container>
  )
}

export default InitialClinicalHistoryContainer
