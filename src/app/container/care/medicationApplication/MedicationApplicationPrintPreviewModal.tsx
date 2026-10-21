"use client"

import Modal from "@/components/modal"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUsersByIds } from "@/core/hooks/users/useGetByIdUser"
import type { OrdenActiva } from "@/core/interfaces/care/aplicacionOrden"
import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import { PrinterOutlined } from "@ant-design/icons"
import { Button, Spin } from "antd"
import { useMemo } from "react"
import { createPortal } from "react-dom"
import {
  buildPrintPatient,
  INSTITUTION_PROVIDER_ID,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { MedicationApplicationPrintDocument } from "./MedicationApplicationPrintDocument"

interface Props {
  open: boolean
  onClose: () => void
  admission?: AdmissionResponse
  patient?: GetPatient
  ordenes: OrdenActiva[]
}

const MedicationApplicationPrintPreviewModal = ({
  open,
  onClose,
  admission,
  patient,
  ordenes,
}: Props) => {
  const { data: provider, isLoading: loadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const profesionalIds = useMemo(
    () => [...new Set(ordenes.flatMap((o) => o.aplicaciones?.map((a) => a.profesionalId) ?? []))],
    [ordenes],
  )
  const { usersById, isLoading: loadingProfesionales } = useGetUsersByIds(open ? profesionalIds : [])
  // Se fija al abrir para que vista previa e impresión muestren la misma hora.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const printedAt = useMemo(() => new Date(), [open])

  const isLoading = loadingProvider || loadingProfesionales

  const printContent = !isLoading && (
    <MedicationApplicationPrintDocument
      provider={provider}
      patient={buildPrintPatient(admission, patient)}
      admissionId={admission?.id}
      admissionDate={admission?.admissionDate ?? ""}
      contractName={admission?.convenioNombre || patient?.contractName || ""}
      ordenes={ordenes}
      profesionalesById={usersById}
      printedAt={printedAt}
    />
  )

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Aplicación de Medicamentos"
        size="xl"
        footer={
          <>
            <Button onClick={onClose}>Cerrar</Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              disabled={isLoading}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
          </>
        }
      >
        <div className="hci-print-screen-wrap">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <Spin size="large" />
            </div>
          ) : (
            open && printContent
          )}
        </div>
      </Modal>

      {open &&
        !isLoading &&
        typeof window !== "undefined" &&
        createPortal(<div className="hci-print-portal">{printContent}</div>, window.document.body)}
    </>
  )
}

export default MedicationApplicationPrintPreviewModal
