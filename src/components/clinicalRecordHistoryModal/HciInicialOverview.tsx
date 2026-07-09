"use client"

import { ExperimentOutlined, FileTextOutlined, HeartOutlined, SolutionOutlined } from "@ant-design/icons"
import { Empty, Skeleton, Tag, Typography } from "antd"
import type { ReactNode } from "react"
import { useGetHCInicialByAdmission } from "@/core/hooks/care/hciInicial/useGetHCInicialByAdmission"

interface Props {
  admissionId?: string | number
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

interface SectionProps {
  icon: ReactNode
  color: string
  title: string
  children: ReactNode
}

const Section = ({ icon, color, title, children }: SectionProps) => (
  <section className="chrm-hci-section">
    <div className="chrm-hci-section-header" style={{ borderLeftColor: color }}>
      <span className="chrm-hci-section-icon" style={{ color }}>{icon}</span>
      <span className="chrm-hci-section-title">{title}</span>
    </div>
    <div className="chrm-hci-section-body">{children}</div>
  </section>
)

interface FieldProps {
  label: string
  value?: string | number | null
}

const Field = ({ label, value }: FieldProps) => (
  <div className="chrm-detail-field">
    <span className="chrm-detail-field-label">{label}</span>
    <p className="chrm-detail-field-value">
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
)

export const HciInicialOverview = ({ admissionId }: Props) => {
  const { data, isLoading } = useGetHCInicialByAdmission(admissionId)

  if (isLoading) {
    return (
      <div className="chrm-skeleton-wrap">
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} active paragraph={{ rows: 3 }} />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="chrm-state-message">
        <Empty description="Aún no se ha creado la Historia Clínica Inicial para esta admisión." />
      </div>
    )
  }

  const { subjetivo, objetivo, signosVitales, analisisDiagnosticosPlan } = data

  return (
    <div className="chrm-hci-overview">
      <div className="chrm-hci-meta">
        <span>{data.nombrePaciente} · {data.documentoPaciente}</span>
        <span>Fecha de atención: {data.admissionDate}</span>
        <span>Hora de admisión: {data.admissionTime || "—"}</span>
        <span>Última actualización: {formatDateTime(data.updatedAt)}</span>
      </div>

      <Section icon={<FileTextOutlined />} color="#0f6f5c" title="Subjetivo">
        {subjetivo ? (
          <div className="chrm-hci-grid">
            <Field label="Motivo de consulta" value={subjetivo.motivoConsulta} />
            <Field label="Enfermedad actual" value={subjetivo.enfermedadActual} />
          </div>
        ) : (
          <Typography.Text type="secondary">Sin registrar.</Typography.Text>
        )}
      </Section>

      <Section icon={<HeartOutlined />} color="#d4380d" title="Signos vitales">
        {signosVitales ? (
          <div className="chrm-hci-grid chrm-hci-grid--compact">
            <Field label="TA" value={signosVitales.tensionArterial} />
            <Field label="FC (lpm)" value={signosVitales.frecuenciaCardiaca} />
            <Field label="FR (rpm)" value={signosVitales.frecuenciaRespiratoria} />
            <Field label="Temperatura (°C)" value={signosVitales.temperatura} />
            <Field label="Sat. O₂ (%)" value={signosVitales.saturacionOxigeno} />
            <Field label="Glasgow" value={signosVitales.glasgow} />
            <Field label="Peso (kg)" value={signosVitales.peso} />
            <Field label="Talla (m)" value={signosVitales.talla} />
            <Field label="IMC" value={signosVitales.imc} />
          </div>
        ) : (
          <Typography.Text type="secondary">Sin registrar.</Typography.Text>
        )}
      </Section>

      <Section icon={<SolutionOutlined />} color="#531dab" title="Objetivo">
        {objetivo ? (
          <>
            <Typography.Text strong style={{ fontSize: 12.5 }}>Examen físico</Typography.Text>
            <div className="chrm-hci-grid" style={{ marginTop: 8, marginBottom: 16 }}>
              <Field label="Cabeza y cuello" value={objetivo.cabezaCuello} />
              <Field label="Torax" value={objetivo.torax} />
              <Field label="Abdomen" value={objetivo.abdomen} />
              <Field label="Extremidades" value={objetivo.extremidades} />
              <Field label="Sistema nervioso" value={objetivo.sistemaNervioso} />
              <Field label="Organos de los sentidos" value={objetivo.organosSentidos} />
              <Field label="Genitourinario" value={objetivo.genitourinario} />
            </div>
            <Typography.Text strong style={{ fontSize: 12.5 }}>Antecedentes</Typography.Text>
            <div className="chrm-hci-grid" style={{ marginTop: 8 }}>
              <Field label="Padres" value={objetivo.padres} />
              <Field label="Personales - Médicos" value={objetivo.personalesMedicos} />
              <Field label="Otros familiares" value={objetivo.otrosFamiliares} />
              <Field label="Alérgicos" value={objetivo.alergicos} />
              <Field label="Quirúrgicos" value={objetivo.quirurgicos} />
              <Field label="Tóxicos" value={objetivo.toxicos} />
              <Field label="Transfusiones" value={objetivo.transfusiones} />
              <Field label="Hábitos" value={objetivo.habitos} />
              <Field label="Traumas" value={objetivo.traumas} />
            </div>
          </>
        ) : (
          <Typography.Text type="secondary">Sin registrar.</Typography.Text>
        )}
      </Section>

      <Section icon={<ExperimentOutlined />} color="#1677ff" title="Análisis, diagnósticos y plan">
        {analisisDiagnosticosPlan ? (
          <>
            <Field label="Análisis" value={analisisDiagnosticosPlan.analisis} />
            <div className="chrm-hci-diagnoses">
              <span className="chrm-detail-field-label">Diagnósticos (CIE-10)</span>
              {analisisDiagnosticosPlan.diagnosticos.length > 0 ? (
                <div className="chrm-hci-tags">
                  {analisisDiagnosticosPlan.diagnosticos.map((d) => (
                    <Tag key={d.id} color="blue">{d.codigo} — {d.descripcion}</Tag>
                  ))}
                </div>
              ) : (
                <p className="chrm-detail-field-value">—</p>
              )}
            </div>
            <Field label="Plan" value={analisisDiagnosticosPlan.plan} />
          </>
        ) : (
          <Typography.Text type="secondary">Sin registrar.</Typography.Text>
        )}
      </Section>
    </div>
  )
}
