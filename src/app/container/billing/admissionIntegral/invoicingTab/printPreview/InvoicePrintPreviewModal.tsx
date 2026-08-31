"use client"

import Modal from "@/components/modal"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetPatientById } from "@/core/hooks/care/patients/useGetByIdPatient"
import { useGetInsuranceCompanyById } from "@/core/hooks/parameterization/insuranceCompany/useGetByIdInsuranceCompany"
import { BillingMovementResponse } from "@/core/interfaces/care/billing"
import { AdmissionResponse } from "@/core/interfaces/care/types"
import { PrinterOutlined } from "@ant-design/icons"
import { Button, Spin } from "antd"
import { createPortal } from "react-dom"
import { InvoicePrintDocument } from "./InvoicePrintDocument"
import "./invoicePrintPreview.css"

// Único proveedor/institución registrado en el sistema (mismo id usado en
// los documentos clínicos imprimibles).
const INSTITUTION_PROVIDER_ID = 32

interface InvoicePrintPreviewModalProps {
  open: boolean
  onClose: () => void
  admission: AdmissionResponse
  movements: BillingMovementResponse[]
  invoicePrefix: string
}

const InvoicePrintPreviewModal = ({
  open,
  onClose,
  admission,
  movements,
  invoicePrefix,
}: InvoicePrintPreviewModalProps) => {
  const { data: provider, isLoading: isLoadingProvider } = useGetProvider(
    open ? INSTITUTION_PROVIDER_ID : 0,
  )
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(
    open ? admission.patientId : null,
  )
  const { data: insurance, isLoading: isLoadingInsurance } = useGetInsuranceCompanyById(
    open ? admission.epsId : 0,
  )

  const isLoading = isLoadingProvider || isLoadingPatient || isLoadingInsurance

  const printContent = !isLoading && (
    <InvoicePrintDocument
      provider={provider}
      admission={admission}
      patient={patient}
      insurance={insurance}
      movements={movements}
      invoicePrefix={invoicePrefix}
    />
  )

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Previsualización de factura"
        size="xl"
        footer={
          <>
            <Button onClick={onClose}>Cerrar</Button>
            <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
              Imprimir
            </Button>
          </>
        }
      >
        <div className="invoice-print-screen-wrap">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spin size="large" />
            </div>
          ) : (
            printContent
          )}
        </div>
      </Modal>

      {/* Copia para impresión montada en un portal fuera del modal — ver la
          nota en HciPrintPreviewModal sobre por qué imprimir la copia dentro
          del modal deja una primera página en blanco. */}
      {open &&
        !isLoading &&
        typeof window !== "undefined" &&
        createPortal(<div className="invoice-print-portal">{printContent}</div>, window.document.body)}
    </>
  )
}

export default InvoicePrintPreviewModal
