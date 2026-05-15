"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Button, Descriptions, Empty } from "antd"
import { useRouter, useSearchParams } from "next/navigation"

interface ClinicalActionModuleProps {
  title: string;
  description: string;
}

const formatAdmissionDate = (value: string | null) => {
  if (!value) return "Sin fecha"

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

const ClinicalActionModule = ({
  title,
  description,
}: ClinicalActionModuleProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const admissionId = searchParams.get("admissionId")
  const patientId = searchParams.get("patientId")
  const patientName = searchParams.get("patientName")
  const documentNumber = searchParams.get("documentNumber")
  const careScope = searchParams.get("careScope")
  const admissionDate = searchParams.get("admissionDate")

  const hasPatientContext = Boolean(admissionId && patientId && patientName)

  return (
    <Container>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileTextOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>{title}</Title>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 24, marginTop: -12 }}>
        {description}
      </p>

      {hasPatientContext ? (
        <>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
            size="middle"
            title="Paciente seleccionado"
            items={[
              {
                key: "patientName",
                label: (
                  <span>
                    <UserOutlined /> Nombre completo
                  </span>
                ),
                children: patientName,
              },
              {
                key: "documentNumber",
                label: (
                  <span>
                    <IdcardOutlined /> Documento
                  </span>
                ),
                children: documentNumber || "Sin documento",
              },
              {
                key: "admissionDate",
                label: (
                  <span>
                    <CalendarOutlined /> Admision
                  </span>
                ),
                children: formatAdmissionDate(admissionDate),
              },
              {
                key: "careScope",
                label: "Ambito de atencion",
                children: careScope || "Sin ambito",
              },
              {
                key: "admissionId",
                label: "Admision ID",
                children: admissionId,
              },
              {
                key: "patientId",
                label: "Paciente ID",
                children: patientId,
              },
            ]}
          />

          <div
            style={{
              marginTop: 24,
              padding: 16,
              border: "1px solid var(--dash-border, #e5e7eb)",
              borderRadius: 8,
              backgroundColor: "var(--dash-surface, #ffffff)",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--theme-primary, #0F6F5C)" }}>
              Modulo listo para operar:
            </span>{" "}
            la navegacion ya entrega el contexto del paciente seleccionado para conectar aqui el formulario o flujo
            especifico del modulo.
          </div>
        </>
      ) : (
        <Empty
          description="Selecciona un paciente desde Evolucionar HC para abrir este modulo con contexto clinico."
        >
          <Button type="primary" onClick={() => router.push("/care/evolveClinicalHistory")}>
            Ir a Evolucionar HC
          </Button>
        </Empty>
      )}
    </Container>
  )
}

export default ClinicalActionModule
