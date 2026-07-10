"use client"

import { Modal } from "antd"
import { EvolucionEspecialistaDetailView, type EvolucionEspecialistaViewData } from "./EvolucionEspecialistaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: EvolucionEspecialistaViewData | null
  title: string
  professionalIsReference?: boolean
}

export const EvolucionEspecialistaPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <EvolucionEspecialistaDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
