"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetElectronicInvoiceByAdmission } from "@/core/hooks/care/billing/useGetElectronicInvoiceByAdmission"
import { CheckCircleFilled, DollarOutlined, FileTextOutlined, SolutionOutlined } from "@ant-design/icons"
import { Alert, Tabs } from "antd"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import AdmissionHeader from "./admissionHeader"
import AdmissionPicker from "./admissionPicker"
import InvoicingTab from "./invoicingTab"
import RipsTab, { RipsValidationResult } from "./ripsTab"
import ServiceLoadingTab from "./serviceLoadingTab"

const AdmissionIntegralContainer = () => {
  const searchParams = useSearchParams()
  const admissionIdParam = searchParams.get("admissionId")
  const admissionId = admissionIdParam ? Number(admissionIdParam) : null

  const {
    data: admission,
    isLoading: isLoadingAdmission,
  } = useGetAdmissionById(admissionId)

  const {
    data: movements = [],
    isLoading: isLoadingMovements,
  } = useGetBillingMovementsByAdmission(admissionId)

  const { data: electronicInvoice } = useGetElectronicInvoiceByAdmission(admissionId ?? undefined)
  const isInvoiced = electronicInvoice?.success ?? false

  const [ripsValidation, setRipsValidation] = useState<RipsValidationResult | null>(null)

  if (!admissionId) {
    return (
      <Container fluid padding="md">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <DollarOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
          <Title level={3}>Admisión integral</Title>
        </div>

        <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 20, marginTop: -8 }}>
          Selecciona una admisión para cargar sus servicios, validar RIPS y facturar
        </p>

        <AdmissionPicker />
      </Container>
    )
  }

  const tabItems = [
    {
      key: "service-loading",
      label: (
        <span>
          <FileTextOutlined /> Cargue de servicios
        </span>
      ),
      children: (
        <ServiceLoadingTab
          admission={admission}
          admissionId={admissionId}
          movements={movements}
          loading={isLoadingMovements}
          readOnly={isInvoiced}
        />
      ),
    },
    {
      key: "rips",
      label: (
        <span>
          <SolutionOutlined /> RIPS
        </span>
      ),
      children: (
        <RipsTab
          admission={admission}
          admissionId={admissionId}
          movements={movements}
          onValidationChange={setRipsValidation}
        />
      ),
    },
    {
      key: "invoicing",
      label: (
        <span>
          <DollarOutlined /> Facturación
        </span>
      ),
      children: (
        <InvoicingTab
          admission={admission}
          movements={movements}
          ripsValidation={ripsValidation}
        />
      ),
    },
  ]

  return (
    <Container fluid padding="md">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <DollarOutlined style={{ fontSize: 22, color: "var(--theme-primary, #0F6F5C)" }} />
        <Title level={3}>Admisión integral</Title>
      </div>

      <p style={{ color: "var(--dash-text-secondary, #6b7280)", marginBottom: 20, marginTop: -8 }}>
        Cargue de servicios, validación RIPS y facturación de la admisión seleccionada
      </p>

      <AdmissionHeader admission={admission} loading={isLoadingAdmission} isInvoiced={isInvoiced} />

      {isInvoiced && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleFilled />}
          message="Esta admisión ya fue facturada electrónicamente"
          description="Los movimientos de facturación quedaron cerrados y no se pueden agregar, editar ni eliminar. Puedes revisar la factura emitida en la pestaña de Facturación."
          style={{ marginBottom: 20 }}
        />
      )}

      <Tabs type="card" items={tabItems} destroyInactiveTabPane={false} />
    </Container>
  )
}

export default AdmissionIntegralContainer
