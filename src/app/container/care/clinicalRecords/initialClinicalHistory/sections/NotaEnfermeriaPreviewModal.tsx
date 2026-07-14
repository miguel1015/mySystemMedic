"use client"

import { Modal } from "antd"
import { NotaEnfermeriaDetailView, type NotaEnfermeriaViewData } from "./NotaEnfermeriaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: NotaEnfermeriaViewData | null
  title: string
  professionalIsReference?: boolean
}

export const NotaEnfermeriaPreviewModal = ({ open, onClose, data, title, professionalIsReference }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <NotaEnfermeriaDetailView data={data} professionalIsReference={professionalIsReference} />}
  </Modal>
)
