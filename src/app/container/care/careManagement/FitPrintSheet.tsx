"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

// Ancho de la hoja A4 (.hci-print-page) y aire a cada lado sobre el fondo gris.
const SHEET_WIDTH_PX = (210 * 96) / 25.4
const GUTTER_PX = 32

// La hoja mide 210mm y el panel de detalle es más angosto: se reduce para que quepa
// completa y solo se desplace verticalmente, como en las demás vistas previas.
// El zoom arranca en 1 y se aplica después de que el documento pagina (sus efectos
// corren antes que este), así la paginación mide la hoja a tamaño real.
export default function FitPrintSheet({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const update = () => setZoom(Math.min(1, Math.max(wrap.clientWidth - GUTTER_PX, 0) / SHEET_WIDTH_PX))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="hci-print-screen-wrap">
      <div style={{ zoom }}>{children}</div>
    </div>
  )
}
