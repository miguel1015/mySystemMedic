"use client"

import Modal from "@/components/modal"
import { useGetProvider } from "@/core/hooks/parameterization/providers/useGetProvider"
import { useGetUsersByIds } from "@/core/hooks/users/useGetByIdUser"
import type { HojaGastoRegistro, TipoHojaGastos } from "@/core/interfaces/care/hojaGastos"
import type { AdmissionResponse, GetPatient } from "@/core/interfaces/care/types"
import { PrinterOutlined } from "@ant-design/icons"
import { Button, Spin } from "antd"
import { useMemo } from "react"
import { createPortal } from "react-dom"
import {
  buildPrintPatient,
  INSTITUTION_PROVIDER_ID,
} from "../clinicalRecords/initialClinicalHistory/printPreview/printDocument.utils"
import { ExpenseSheetPrintDocument } from "./ExpenseSheetPrintDocument"
import { firmantesDe, HOJA_TEXTOS } from "./expenseSheet.utils"

interface Props {
  open: boolean
  onClose: () => void
  tipoHoja: TipoHojaGastos
  admission?: AdmissionResponse
  patient?: GetPatient
  registros: HojaGastoRegistro[]
}

const ExpenseSheetPrintPreviewModal = ({
  open,
  onClose,
  tipoHoja,
  admission,
  patient,
  registros,
}: Props) => {
  const { data: provider, isLoading: loadingProvider } = useGetProvider(INSTITUTION_PROVIDER_ID)
  const firmanteIds = useMemo(() => firmantesDe(registros).map((f) => f.id), [registros])
  const { usersById, isLoading: loadingFirmantes } = useGetUsersByIds(open ? firmanteIds : [])
  // Se fija al abrir para que vista previa e impresión muestren la misma hora.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const printedAt = useMemo(() => new Date(), [open])

  const isLoading = loadingProvider || loadingFirmantes

  const printContent = !isLoading && (
    <ExpenseSheetPrintDocument
      provider={provider}
      patient={buildPrintPatient(admission, patient)}
      admissionId={admission?.id}
      admissionDate={admission?.admissionDate ?? ""}
      contractName={admission?.convenioNombre || patient?.contractName || ""}
      tipoHoja={tipoHoja}
      registros={registros}
      firmantesById={usersById}
      printedAt={printedAt}
    />
  )

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={HOJA_TEXTOS[tipoHoja].titulo}
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

export default ExpenseSheetPrintPreviewModal
