"use client"

import { Modal } from "antd"
import { ProcedimientoNoQxDetailView, type ProcedimientoNoQxViewData } from "./ProcedimientoNoQxDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: ProcedimientoNoQxViewData | null
  title: string
  professionalIsReference?: boolean
}

export const ProcedimientoNoQxPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <ProcedimientoNoQxDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
