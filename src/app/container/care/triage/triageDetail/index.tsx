"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { Button, Divider, Spin, Tag } from "antd"
import {
  ArrowLeftOutlined,
  EditOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { useRouter } from "next/navigation"
import { useGetTriageById } from "@/core/hooks/care/triage/useGetTriageById"
import {
  TriagePriority,
  VitalSignsDto,
} from "@/core/interfaces/care/types"

const PRIORITY_COLOR: Record<TriagePriority, string> = {
  I: "#ff4d4f",
  II: "#fa8c16",
  III: "#fadb14",
  IV: "#52c41a",
  V: "#1890ff",
}

const PRIORITY_LABEL: Record<TriagePriority, string> = {
  I: "I - Resucitación",
  II: "II - Emergencia",
  III: "III - Urgencia",
  IV: "IV - Menos urgente",
  V: "V - No urgente",
}

const sectionCardStyle: React.CSSProperties = {
  background: "var(--dash-surface, #ffffff)",
  border: "1px solid var(--dash-border-subtle, #f0f0f3)",
  borderRadius: 10,
  padding: "20px 24px",
  marginBottom: 20,
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--theme-primary, #0F6F5C)",
  marginBottom: 4,
  marginTop: 0,
  display: "flex",
  alignItems: "center",
  gap: 8,
}

function Field({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div style={{ minWidth: 160 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--dash-text-tertiary, #9ca3af)",
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 600 }}>{value ?? "—"}</div>
    </div>
  )
}

function formatOrDash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  return String(value)
}

function VitalSignsCard({ signs }: { signs: VitalSignsDto }) {
  return (
    <div style={sectionCardStyle}>
      <p style={sectionTitleStyle}>
        <HeartOutlined />
        Signos Vitales
      </p>
      <Divider style={{ margin: "8px 0 16px" }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        <Field label="Tensión Arterial" value={formatOrDash(signs.tensionArterial)} />
        <Field
          label="Frecuencia Cardiaca (lpm)"
          value={formatOrDash(signs.frecuenciaCardiaca)}
        />
        <Field
          label="Frecuencia Respiratoria (rpm)"
          value={formatOrDash(signs.frecuenciaRespiratoria)}
        />
        <Field label="Peso (kg)" value={formatOrDash(signs.peso)} />
        <Field label="Talla (cm)" value={formatOrDash(signs.talla)} />
        <Field
          label="Temperatura (°C)"
          value={formatOrDash(signs.temperatura)}
        />
        <Field label="Glasgow" value={formatOrDash(signs.glasgow)} />
      </div>
    </div>
  )
}

interface TriageDetailProps {
  id: string
}

export default function TriageDetail({ id }: TriageDetailProps) {
  const router = useRouter()
  const { data, isLoading, isError } = useGetTriageById(id)

  if (isLoading) {
    return (
      <Container>
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      </Container>
    )
  }

  if (isError || !data) {
    return (
      <Container>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 40,
            gap: 16,
          }}
        >
          <p>Triaje no encontrado.</p>
          <Button onClick={() => router.push("/care/triage")}>
            Volver al listado
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MedicineBoxOutlined
            style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }}
          />
          <Title level={3}>Detalle de Triage</Title>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/care/triage")}
          >
            Volver
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => router.push(`/care/triage/${data.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          <UserOutlined />
          Paciente
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          <Field
            label="Documento"
            value={
              <span style={{ fontFamily: "monospace" }}>
                {data.numeroDocumento}
              </span>
            }
          />
          <Field label="Paciente" value={data.nombrePaciente} />
        </div>
      </div>

      <div style={sectionCardStyle}>
        <p style={sectionTitleStyle}>
          <MedicineBoxOutlined />
          Triage
        </p>
        <Divider style={{ margin: "8px 0 16px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          <Field
            label="Fecha / Hora"
            value={new Date(data.fechaHora).toLocaleString()}
          />
          <Field
            label="Prioridad"
            value={
              <Tag
                style={{
                  color: "#fff",
                  background: PRIORITY_COLOR[data.prioridad],
                  borderColor: PRIORITY_COLOR[data.prioridad],
                  fontWeight: 600,
                }}
              >
                {PRIORITY_LABEL[data.prioridad]}
              </Tag>
            }
          />
          <Field
            label="Estado"
            value={data.isActive ? "Activo" : "Inactivo"}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--dash-text-tertiary, #9ca3af)",
              marginBottom: 4,
            }}
          >
            Motivo de Consulta
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              background: "var(--dash-surface-hover, #f3f4f6)",
              color: "var(--dash-text-primary, #111827)",
              padding: 12,
              borderRadius: 6,
              border: "1px solid var(--dash-border-subtle, #f0f0f3)",
            }}
          >
            {data.motivoConsulta || "—"}
          </div>
        </div>
      </div>

      <VitalSignsCard signs={data.signosVitales ?? {}} />
    </Container>
  )
}
