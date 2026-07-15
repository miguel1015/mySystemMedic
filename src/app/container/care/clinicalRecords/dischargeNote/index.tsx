"use client"

import { Container } from "@/components/container"
import { useMe } from "@/core/hooks/users/useMeUser"
import { useGetUsers } from "@/core/hooks/users/useGetUsers"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { GetUser } from "@/core/interfaces/user/users"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  PrinterOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Select, Tag, Typography, message } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DischargeNoteContent } from "./DischargeNoteContent"

const buildFullName = (user?: GetUser) => {
  if (!user) return ""
  return (
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
    user.username ||
    user.email
  )
}

const formatAdmissionDate = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatAdmissionTime = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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

const DischargeNoteContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messageApi, contextHolder] = message.useMessage()
  const { data: me } = useMe()
  const { data: users = [] } = useGetUsers()

  const admissionId = searchParams.get("admissionId") || undefined
  const { data: admission } = useGetAdmissionById(admissionId)
  const patientId =
    searchParams.get("patientId") ||
    (admission ? String(admission.patientId) : undefined)
  const { data: patientRecord } = useGetPatientById(patientId ?? null)

  const patientFullName = [
    patientRecord?.firstName,
    patientRecord?.middleName,
    patientRecord?.lastName,
    patientRecord?.secondLastName,
  ]
    .filter(Boolean)
    .join(" ")

  const patient = {
    name:
      patientFullName ||
      admission?.nombrePaciente ||
      searchParams.get("patientName") ||
      "Andres Felipe Quintero Perez",
    documentType: searchParams.get("documentType") || "CC",
    documentNumber:
      admission?.documentoPatiente ||
      searchParams.get("documentNumber") ||
      "1102796382",
    careScope:
      admission?.careScopeName || searchParams.get("careScope") || "Urgencias",
    birthDate: searchParams.get("birthDate") || "2004-08-04",
    sex: searchParams.get("sex") || "Masculino",
  }

  const currentDoctor = me?.name || "Dr. Martin Martinez Perez"

  const canAssignDoctor = useMemo(() => {
    const role = (me?.role || "").toLowerCase()
    return ["admin", "administrador", "coordinador", "jefe"].some((word) =>
      role.includes(word),
    )
  }, [me?.role])

  const doctorOptions = useMemo(() => {
    const mapped = users.map((user) => ({
      value: user.id,
      label: buildFullName(user),
      role: user.userRoleName,
    }))
    if (mapped.length) return mapped
    return [
      { value: me?.id || 0, label: currentDoctor, role: me?.role || "Medico" },
    ]
  }, [currentDoctor, me?.id, me?.role, users])

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(
    doctorOptions[0]?.value,
  )

  useEffect(() => {
    if (!doctorOptions.length) return
    if (
      selectedDoctorId === undefined ||
      !doctorOptions.some((d) => d.value === selectedDoctorId)
    ) {
      setSelectedDoctorId(doctorOptions[0].value)
    }
  }, [doctorOptions, selectedDoctorId])

  const selectedDoctor =
    doctorOptions.find((d) => d.value === selectedDoctorId)?.label ||
    currentDoctor

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
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>Volver</Button>
            </div>
          </div>

          <div className="clinical-history-summary">
            <div className="summary-cell">
              <div className="summary-cell-label">Fecha de admisión</div>
              <div className="summary-cell-value">
                {formatAdmissionDate(admission?.admissionDate) || "—"}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Hora de admisión</div>
              <div className="summary-cell-value">
                {formatAdmissionTime(admission?.admissionDate) || "—"}
              </div>
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
                    showSearch
                    value={selectedDoctorId}
                    options={doctorOptions}
                    onChange={setSelectedDoctorId}
                    style={{ width: "100%", marginTop: 2 }}
                    size="small"
                  />
                ) : (
                  selectedDoctor
                )}
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Diagnóstico principal</div>
              <div className="summary-cell-value">
                <span
                  style={{
                    color: "var(--dash-text-tertiary, #93a39d)",
                    fontSize: 12,
                  }}
                >
                  Sin diagnóstico
                </span>
              </div>
            </div>
            <div className="summary-cell">
              <div className="summary-cell-label">Estado</div>
              <div className="summary-cell-value">
                <Tag color="green" style={{ margin: 0 }}>
                  Hospitalizado
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* ════ FORM ════ */}
        <div style={{ marginTop: 14 }}>
          <DischargeNoteContent messageApi={messageApi} currentDoctor={currentDoctor} />
        </div>

      </div>
    </Container>
  )
}

export default DischargeNoteContainer
