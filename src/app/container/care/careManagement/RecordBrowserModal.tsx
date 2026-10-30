"use client"

import { ClockCircleOutlined, PrinterOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Empty, Skeleton } from "antd"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import Modal from "@/components/modal"
import "@/components/clinicalRecordHistoryModal/clinicalRecordHistoryModal.css"
import "./careManagement.css"

export interface BrowserItem {
  key: string
  date: string
  author?: string
  excerpt?: string
  tags?: ReactNode
  // Acciones del registro seleccionado (modificar, eliminar...).
  actions?: ReactNode
  renderDetail: () => ReactNode
  // Documento que se imprime para el registro seleccionado.
  renderPrint?: () => ReactNode
}

interface Props {
  open: boolean
  onClose: () => void
  title: ReactNode
  items: BrowserItem[]
  loading?: boolean
  emptyText: string
}

// Listado de registros a la izquierda y el detalle del seleccionado a la derecha,
// como los históricos de Evolucionar HC. En pantallas angostas es lista y luego detalle.
export default function RecordBrowserModal({ open, onClose, ...props }: Props) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Mientras se anima el cierre se sigue mostrando lo último que tenía abierto: el padre
  // vacía título y registros al cerrar, y si el contenido cambia el modal se encoge y
  // parece que volviera a abrirse antes de irse.
  const lastShown = useRef(props)
  if (open) lastShown.current = props
  const { title, items, loading, emptyText } = open ? props : lastShown.current

  // La selección se limpia al volver a abrir, no al cerrar, por la misma razón.
  useLayoutEffect(() => {
    if (open) setSelectedKey(null)
  }, [open])

  // Si el registro deja de existir (se eliminó), se vuelve al listado.
  const selected = items.find((item) => item.key === selectedKey)
  const printContent = selected?.renderPrint?.()

  return (
    <>
      <Modal open={open} onClose={onClose} size="xl" title={title} instant>
        {loading ? (
          <div className="chrm-skeleton-wrap">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} active paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="chrm-state-message">
            <Empty description={emptyText} />
          </div>
        ) : (
          <div className={`chrm-body chb-body${selected ? " has-selection" : ""}`}>
            <div className="chrm-list">
              <ul className="chrm-timeline">
                {items.map((item, index) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`chrm-item${item.key === selectedKey ? " active" : ""}`}
                      onClick={() => setSelectedKey(item.key)}
                    >
                      <div className="chrm-item-top">
                        <span className="chrm-item-date">
                          <ClockCircleOutlined /> #{index + 1} · {item.date}
                        </span>
                      </div>
                      {item.author && (
                        <div className="chrm-item-author">
                          <UserOutlined /> {item.author}
                        </div>
                      )}
                      {item.excerpt && <p className="chrm-item-excerpt">{item.excerpt}</p>}
                      {item.tags && <div className="chb-item-tags">{item.tags}</div>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chrm-detail">
              {selected ? (
                <>
                  <button type="button" className="chrm-back-btn" onClick={() => setSelectedKey(null)}>
                    ← Volver al listado
                  </button>
                  <div className="chb-detail-actions">
                    {selected.actions}
                    {printContent && (
                      <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                        Imprimir
                      </Button>
                    )}
                  </div>
                  {/* Con key cada registro monta su documento de cero y pagina a tamaño real. */}
                  <div key={selected.key}>{selected.renderDetail()}</div>
                </>
              ) : (
                <div className="chrm-detail-empty">
                  <Empty description="Selecciona un registro del listado para ver el detalle." />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Igual que los demás documentos: se imprime desde un portal en <body>. Lleva también
          la clase de la factura porque su CSS (cargado por la impresión de la HC completa)
          oculta al imprimir todo hijo de <body> que no la tenga. */}
      {open &&
        printContent &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="hci-print-portal invoice-print-portal">{printContent}</div>,
          window.document.body,
        )}
    </>
  )
}
