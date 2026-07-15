"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { DiagnosticProceduresSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/DiagnosticProceduresSection"
import { EvolutionSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/EvolutionSection"
import { MedicalNotesSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/MedicalNotesSection"
import { MinorProceduresSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/MinorProceduresSection"
import { NonSurgicalSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/NonSurgicalSection"
import { NursingNoteSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/NursingNoteSection"
import { SpecialistEvolutionSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/SpecialistEvolutionSection"
import { SurgicalDescriptionSection } from "@/app/container/care/clinicalRecords/initialClinicalHistory/sections/SurgicalDescriptionSection"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { GetUser } from "@/core/interfaces/user/users"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Tag, Typography, message } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { ReactNode, useMemo, useState } from "react"
import "../clinicalRecords/initialClinicalHistory/initialClinicalHistory.css"

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

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <SurgicalDescriptionSection
            doctorOptions={doctorOptions}
            patientName={patient.name}
            messageApi={messageApi}
          />
        </div>
      </div>
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

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"
  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <NursingNoteSection
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
  const admissionId = searchParams.get("admissionId") || undefined

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <DiagnosticProceduresSection
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

  return (
    <Container fluid padding="none" className="clinical-history-shell">
      {contextHolder}
      <div className="clinical-history-page">
        <PatientHeader patient={patient} currentDoctor={currentDoctor} router={router} onSave={() => {}} hideSave />
        <div style={{ marginTop: 14, background: "var(--dash-surface, #fff)", border: "1px solid var(--dash-border, #e4eae8)", borderRadius: 10, overflow: "hidden" }}>
          <NonSurgicalSection
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
