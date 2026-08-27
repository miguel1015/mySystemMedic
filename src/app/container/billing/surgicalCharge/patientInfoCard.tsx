"use client"

import { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import { CalendarOutlined, IdcardOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Skeleton, Tag } from "antd"
import { calculateAge } from "./utils"

interface PatientInfoCardProps {
  admission: AdmissionResponse | undefined
  patient: GetPatient | undefined
  loading: boolean
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  return (first + last).toUpperCase()
}

const cardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 12,
  border: "1px solid rgba(15, 111, 92, 0.2)",
  background:
    "linear-gradient(135deg, rgba(15, 111, 92, 0.08) 0%, rgba(15, 111, 92, 0.02) 100%)",
  borderLeft: "4px solid var(--theme-primary, #0F6F5C)",
  marginBottom: 20,
}

const metaLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "var(--dash-text-tertiary, #9ca3af)",
  marginBottom: 2,
}

const metaValueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--dash-text-primary, #111827)",
}

const PatientInfoCard = ({ admission, patient, loading }: PatientInfoCardProps) => {
  if (loading || !admission) {
    return (
      <div style={cardStyle}>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    )
  }

  const age = calculateAge(patient?.birthDate)

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar
          size={56}
          style={{
            background: "var(--theme-primary, #0F6F5C)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(admission.nombrePaciente) || <UserOutlined />}
        </Avatar>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--dash-text-primary, #111827)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {admission.nombrePaciente}
            <Tag color="green">Admisión #{admission.id}</Tag>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={metaLabelStyle}>
                <IdcardOutlined /> Documento
              </div>
              <div style={metaValueStyle}>
                {admission.documentTypeCode} {admission.documentoPatiente}
              </div>
            </div>
            <div>
              <div style={metaLabelStyle}>Edad</div>
              <div style={metaValueStyle}>{age !== null ? `${age} años` : "Sin dato"}</div>
            </div>
            <div>
              <div style={metaLabelStyle}>Sexo</div>
              <div style={metaValueStyle}>{patient?.sexName || "Sin dato"}</div>
            </div>
            <div>
              <div style={metaLabelStyle}>
                <CalendarOutlined /> Fecha de admisión
              </div>
              <div style={metaValueStyle}>
                {new Date(admission.admissionDate).toLocaleDateString("es-CO")}
              </div>
            </div>
            <div>
              <div style={metaLabelStyle}>Convenio</div>
              <div style={metaValueStyle}>{admission.convenioNombre || "Sin convenio"}</div>
            </div>
            <div>
              <div style={metaLabelStyle}>EPS</div>
              <div style={metaValueStyle}>{admission.epsNombre || "Sin EPS"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientInfoCard
