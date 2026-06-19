"use client"

import { Container } from "@/components/container"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { GetUser } from "@/core/interfaces/user/users"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  PrinterOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Button,
  Input,
  Select,
  Tag,
  Typography,
  message,
} from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DischargeNoteContent } from "../dischargeNote/DischargeNoteContent"
import { sidebarRecords } from "./constants"
import { DiagnosticProceduresSection } from "./sections/DiagnosticProceduresSection"
import { EvolutionSection } from "./sections/EvolutionSection"
import { HciSection } from "./sections/HciSection"
import { MedicalNotesSection } from "./sections/MedicalNotesSection"
import { MinorProceduresSection } from "./sections/MinorProceduresSection"
import { NonSurgicalSection } from "./sections/NonSurgicalSection"
import { NursingNoteSection } from "./sections/NursingNoteSection"
import { SpecialistEvolutionSection } from "./sections/SpecialistEvolutionSection"
import { SurgicalDescriptionSection } from "./sections/SurgicalDescriptionSection"
import type { DiagnosisRow } from "./types"
import "./initialClinicalHistory.css"

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

const clickableSidebarKeys = new Set([
  "hci", "quirurgica", "evoluciones", "egreso",
  "enfermeria", "menores", "medicas", "diagnosticos",
  "noquirurgicos", "especialista",
])

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
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([])
  const [activeSidebarKey, setActiveSidebarKey] = useState("hci")

  useEffect(() => {
    if (!doctorOptions.length) return
    if (selectedDoctorId === undefined || !doctorOptions.some((d) => d.value === selectedDoctorId)) {
      setSelectedDoctorId(doctorOptions[0].value)
    }
  }, [doctorOptions, selectedDoctorId])

  const selectedDoctor = doctorOptions.find((d) => d.value === selectedDoctorId)?.label || currentDoctor
  const mainDiagnosis = useMemo(() => diagnoses.find((d) => d.main && d.code), [diagnoses])

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
                  <Select
                    showSearch value={selectedDoctorId} options={doctorOptions}
                    onChange={setSelectedDoctorId}
                    style={{ width: "100%", marginTop: 2 }} size="small"
                  />
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
              {sidebarRecords.map((record) => (
                <button
                  key={record.key}
                  type="button"
                  className={`sidebar-record-item${activeSidebarKey === record.key ? " active" : ""}${!clickableSidebarKeys.has(record.key) ? " sidebar-record-disabled" : ""}`}
                  onClick={() => { if (clickableSidebarKeys.has(record.key)) setActiveSidebarKey(record.key) }}
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
              ))}
            </div>
          </aside>

          {/* ── RIGHT AREA ── */}
          <div className="evolution-right">
            {activeSidebarKey === "hci" && (
              <HciSection
                diagnoses={diagnoses}
                onDiagnosesChange={setDiagnoses}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "quirurgica" && (
              <SurgicalDescriptionSection
                doctorOptions={doctorOptions}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "evoluciones" && (
              <EvolutionSection
                selectedDoctor={selectedDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "egreso" && (
              <DischargeNoteContent messageApi={messageApi} />
            )}

            {activeSidebarKey === "enfermeria" && (
              <NursingNoteSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "diagnosticos" && (
              <DiagnosticProceduresSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "menores" && (
              <MinorProceduresSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "medicas" && (
              <MedicalNotesSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "noquirurgicos" && (
              <NonSurgicalSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}

            {activeSidebarKey === "especialista" && (
              <SpecialistEvolutionSection
                currentDoctor={currentDoctor}
                patientName={patient.name}
                messageApi={messageApi}
              />
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export default InitialClinicalHistoryContainer
