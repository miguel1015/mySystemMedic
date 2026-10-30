"use client"

import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { Button } from "antd"
import { FilePdfOutlined, PrinterOutlined } from "@ant-design/icons"
import Modal from "@/components/modal"

interface Props {
  open: boolean
  onClose: () => void
  // Mientras no esté listo se muestra `progress` y no se puede imprimir.
  ready: boolean
  progress: ReactNode
  // Aviso que se ve en la vista previa pero no se imprime.
  notice?: ReactNode
  // Nombre sugerido del PDF: el navegador toma el título de la página.
  fileName: string
  children: ReactNode
}

// Vista previa del expediente completo. Igual que los demás documentos, se imprime
// desde un portal en <body> (ver HciPrintPreviewModal). Lleva las dos clases de
// portal porque la hoja de estilos de la factura oculta todo lo que no sea su portal.
export default function AdmissionRecordPrintModal({
  open,
  onClose,
  ready,
  progress,
  notice,
  fileName,
  children,
}: Props) {
  const print = (asPdf: boolean) => {
    if (!asPdf) {
      window.print()
      return
    }
    const previousTitle = document.title
    document.title = fileName
    window.addEventListener("afterprint", () => (document.title = previousTitle), { once: true })
    window.print()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Vista previa - Expediente de la admisión"
        size="xl"
        instant
        footer={
          <>
            <Button onClick={onClose}>Cerrar</Button>
            <Button icon={<FilePdfOutlined />} disabled={!ready} onClick={() => print(true)}>
              Exportar PDF
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              disabled={!ready}
              onClick={() => print(false)}
            >
              Imprimir
            </Button>
          </>
        }
      >
        {ready ? (
          <>
            {notice}
            <div className="hci-print-screen-wrap">{children}</div>
          </>
        ) : (
          progress
        )}
      </Modal>

      {open &&
        ready &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="hci-print-portal invoice-print-portal">{children}</div>,
          window.document.body,
        )}
    </>
  )
}
