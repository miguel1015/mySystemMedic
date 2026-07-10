"use client"

import { Modal } from "antd"
import { EvolucionDetailView, type EvolucionViewData } from "./EvolucionDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: EvolucionViewData | null
  title: string
  professionalIsReference?: boolean
}

export const EvolucionPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <EvolucionDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
