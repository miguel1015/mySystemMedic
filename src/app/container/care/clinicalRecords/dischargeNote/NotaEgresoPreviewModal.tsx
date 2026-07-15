"use client"

import { Modal } from "antd"
import { NotaEgresoDetailView, type NotaEgresoViewData } from "./NotaEgresoDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: NotaEgresoViewData | null
}

export const NotaEgresoPreviewModal = ({ open, onClose, data }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title="Vista previa de la nota de egreso" width={720}>
    {data && <NotaEgresoDetailView data={data} />}
  </Modal>
)
