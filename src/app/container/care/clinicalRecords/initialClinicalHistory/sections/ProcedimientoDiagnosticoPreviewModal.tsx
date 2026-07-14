"use client"

import { Modal } from "antd"
import { ProcedimientoDiagnosticoDetailView, type ProcedimientoDiagnosticoViewData } from "./ProcedimientoDiagnosticoDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: ProcedimientoDiagnosticoViewData | null
  title: string
  professionalIsReference?: boolean
}

export const ProcedimientoDiagnosticoPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <ProcedimientoDiagnosticoDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
