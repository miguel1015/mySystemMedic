"use client"

import { ReactNode, useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./modal.css"

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  // Para modales con documentos grandes: montar o quitar una hoja A4 completa traba el
  // navegador justo cuando corre la animación de framer-motion, que pierde fotogramas y se
  // ve como un parpadeo al abrir o el modal congelado al cerrar. Con esta opción la entrada
  // y la salida son animaciones CSS (.modal-instant en modal.css).
  instant?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  instant = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Con `instant` el montaje es propio: al cerrar el modal sigue en pantalla con la clase
  // is-closing hasta que termina su animación CSS de salida.
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)
  const closing = present && !open

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open || !modalRef.current) return
    const timer = setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        modalRef.current?.focus()
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [open])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusableElements.length === 0) return

        const first = focusableElements[0]
        const last = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, handleKeyDown])

  const dialog = (
    <div
      ref={modalRef}
      className={`modal-dialog-custom modal-size-${size}`}
      // Un clic afuera no cierra el modal (solo la X, Escape o los botones del pie), para no
      // perder lo diligenciado por un clic accidental. Se sigue frenando la propagación
      // por si el modal está dentro de un elemento clicable.
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={(e) => {
        // Solo la salida del propio cuadro, no animaciones de su contenido (spinners...).
        if (closing && e.target === e.currentTarget) setPresent(false)
      }}
      role="document"
    >
      <div className="modal-content-custom">
        {title && (
          <div className="modal-header-custom">
            <h5 className="modal-title-custom" id="modal-title">
              {title}
            </h5>
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Cerrar modal"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}

        <div className="modal-body-custom">
          {children}
        </div>

        {footer && (
          <div className="modal-footer-custom">{footer}</div>
        )}
      </div>
    </div>
  )

  const dialogProps = {
    tabIndex: -1,
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": title ? "modal-title" : undefined,
  } as const

  if (instant) {
    if (!present) return null
    const state = closing ? " is-closing" : ""
    return (
      <>
        <div className={`modal-overlay modal-instant${state}`} />
        <div className={`modal-wrapper modal-instant${state}`} {...dialogProps}>
          {dialog}
        </div>
      </>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="modal-wrapper"
            {...dialogProps}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // El cierre es una transición corta y no el resorte de la entrada: el resorte
            // tardaba más que el fondo oscuro en irse y el modal quedaba visible un instante
            // sobre la página ya descubierta, como si se volviera a abrir.
            exit={{ opacity: 0, y: 30, scale: 0.97, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              mass: 0.8,
            }}
          >
            {dialog}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal
