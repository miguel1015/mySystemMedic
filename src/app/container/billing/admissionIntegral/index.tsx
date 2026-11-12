"use client"

import { Container } from "@/components/container"
import PageHeader from "@/components/dataTable/PageHeader"
import { useGetAdmissionById } from "@/core/hooks/care/admissions/useGetAdmissionById"
import { useGetBillingMovementsByAdmission } from "@/core/hooks/care/billing/useGetBillingMovementsByAdmission"
import { useGetElectronicInvoiceByAdmission } from "@/core/hooks/care/billing/useGetElectronicInvoiceByAdmission"
import { ArrowLeftOutlined, CheckCircleFilled, DollarOutlined, FileTextOutlined, SolutionOutlined } from "@ant-design/icons"
import { Alert, Button, Tabs } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import AdmissionHeader from "./admissionHeader"
import AdmissionPicker from "./admissionPicker"
import InvoicingTab from "./invoicingTab"
import RipsTab, { RipsValidationResult } from "./ripsTab"
import ServiceLoadingTab from "./serviceLoadingTab"

const AdmissionIntegralContainer = () => {
  const router = useRouter()
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

  const { data: electronicInvoice, isLoading: isLoadingElectronicInvoice } =
    useGetElectronicInvoiceByAdmission(admissionId ?? undefined)
  const isInvoiced = electronicInvoice?.success ?? false

  const [ripsValidation, setRipsValidation] = useState<RipsValidationResult | null>(null)

  if (!admissionId) {
    return (
      <Container fluid padding="md">
        <PageHeader
          icon={<DollarOutlined />}
          title="Admisión integral"
          subtitle="Selecciona una admisión para cargar sus servicios, validar RIPS y facturar"
        />

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
          <SolutionOutlined /> Validación RIPS
        </span>
      ),
      children: (
        <RipsTab
          admissionId={admissionId}
          readOnly={isInvoiced}
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
          // Al cambiar de admisión se reinicia el periodo escogido (vuelve a admisión → hoy).
          key={admissionId}
          admission={admission}
          movements={movements}
          ripsValidation={ripsValidation}
          electronicInvoice={electronicInvoice}
          isLoadingElectronicInvoice={isLoadingElectronicInvoice}
        />
      ),
    },
  ]

  return (
    <Container fluid padding="md">
      <PageHeader
        icon={<DollarOutlined />}
        title="Admisión integral"
        subtitle="Cargue de servicios, validación RIPS y facturación de la admisión seleccionada"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/billing/admissionIntegral")}>
            Volver al listado
          </Button>
        }
      />

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
