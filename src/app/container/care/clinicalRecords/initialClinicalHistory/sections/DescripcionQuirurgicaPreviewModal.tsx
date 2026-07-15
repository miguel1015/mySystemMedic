"use client"

import { Modal } from "antd"
import { DescripcionQuirurgicaDetailView, type DescripcionQuirurgicaViewData } from "./DescripcionQuirurgicaDetailView"

interface Props {
  open: boolean
  onClose: () => void
  data: DescripcionQuirurgicaViewData | null
  title: string
}

export const DescripcionQuirurgicaPreviewModal = ({ open, onClose, data, title }: Props) => (
  <Modal open={open} onCancel={onClose} onOk={onClose} okText="Cerrar" cancelButtonProps={{ style: { display: "none" } }} title={title} width={720}>
    {data && <DescripcionQuirurgicaDetailView data={data} />}
  </Modal>
)
