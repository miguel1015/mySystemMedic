"use client"

import { Modal } from "antd"
import { ProcedimientoMenorDetailView, type ProcedimientoMenorViewData } from "./ProcedimientoMenorDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: ProcedimientoMenorViewData | null
  title: string
  professionalIsReference?: boolean
}

export const ProcedimientoMenorPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <ProcedimientoMenorDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
