"use client"

import { Alert, Button, Space, Spin, Tabs, Tag } from "antd"
import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetElectronicInvoicingSettings } from "@/core/hooks/parameterization/electronicInvoicing/useGetElectronicInvoicingSettings"
import { ENVIRONMENT_LABELS } from "./catalogs"
import CertificateTab, { certificateStatus } from "./certificateTab"
import CompanyTab from "./companyTab"
import GeneralTab from "./generalTab"
import ResolutionsTab from "./resolutionsTab"
import SoftwareTab, { environmentColor } from "./softwareTab"

export default function ElectronicInvoicingContainer() {
  const { data, isLoading, error, refetch, isFetching } = useGetElectronicInvoicingSettings()

  const header = <Title children="Facturación electrónica" level={3} />

  if (isLoading) {
    return (
      <Container>
        {header}
        <div className="d-flex flex-column align-items-center py-5 gap-2">
          <Spin size="large" />
          <span style={{ color: "var(--dash-text-tertiary, #9ca3af)" }}>
            Consultando el servicio de Facturación Electrónica (puede tardar si estaba inactivo)...
          </span>
        </div>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container>
        {header}
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar la configuración de facturación electrónica"
          description={(error as Error | null)?.message}
          action={
            <Button onClick={() => refetch()} loading={isFetching}>
              Reintentar
            </Button>
          }
        />
      </Container>
    )
  }

  const activeResolution = data.resolutions.find((r) => r.isActive)
  const certificate = certificateStatus(data.certificates.find((c) => c.isActive))

  const tabItems = [
    {
      key: "company",
      label: "Emisor",
      children: data.company ? <CompanyTab company={data.company} states={data.states} /> : null,
    },
    {
      key: "software",
      label: "Software y ambiente",
      children: <SoftwareTab software={data.software} resolutions={data.resolutions} />,
    },
    {
      key: "resolutions",
      label: "Resoluciones",
      children: <ResolutionsTab resolutions={data.resolutions} software={data.software} />,
    },
    {
      key: "certificate",
      label: "Certificado",
      children: (
        <CertificateTab
          certificates={data.certificates}
          hasCertificatePin={data.company?.hasCertificatePin ?? false}
        />
      ),
    },
    {
      key: "general",
      label: "Consecutivo y pago",
      children: <GeneralTab local={data.local} resolutions={data.resolutions} />,
    },
  ]

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        {header}
        <Space wrap>
          <span>
            Ambiente:{" "}
            {data.software ? (
              <Tag color={environmentColor(data.software.environment)}>
                {ENVIRONMENT_LABELS[data.software.environment] ?? data.software.environment}
              </Tag>
            ) : (
              <Tag color="red">Sin software</Tag>
            )}
          </span>
          <span>
            Resolución:{" "}
            {activeResolution ? (
              <Tag color="green">
                {activeResolution.prefix} - {activeResolution.resolutionNum}
              </Tag>
            ) : (
              <Tag color="red">Sin resolución activa</Tag>
            )}
          </span>
          <span>
            Certificado: <Tag color={certificate.color}>{certificate.text}</Tag>
          </span>
        </Space>
      </div>

      {!activeResolution && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="No hay una resolución activa: no se podrán emitir facturas electrónicas hasta activar una en la pestaña «Resoluciones»."
        />
      )}

      <Tabs type="card" items={tabItems} destroyInactiveTabPane={false} />
    </Container>
  )
}
