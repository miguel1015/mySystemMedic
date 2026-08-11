"use client"

import { Container } from "@/components/container"
import Title from "@/components/title"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { DollarOutlined, FileTextOutlined, SolutionOutlined } from "@ant-design/icons"
import { Tabs } from "antd"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import AdmissionHeader from "./admissionHeader"
import AdmissionPicker from "./admissionPicker"
import InvoicingTab from "./invoicingTab"
import RipsTab, { RipsValidationResult } from "./ripsTab"
import ServiceLoadingTab from "./serviceLoadingTab"

const AdmissionIntegralContainer = () => {
  const searchParams = useSearchParams()
  const admissionId = searchParams.get("admissionId")

  const {
    data: admission,
    isLoading: isLoadingAdmission,
  } = useGetAdmissionById(admissionId)

  const {
    data: movements = [],
    isLoading: isLoadingMovements,
  } = useGetBillingMovementsByAdmission(admissionId)

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

      <AdmissionHeader admission={admission} loading={isLoadingAdmission} />

      <Tabs type="card" items={tabItems} destroyInactiveTabPane={false} />
    </Container>
  )
}

export default AdmissionIntegralContainer
