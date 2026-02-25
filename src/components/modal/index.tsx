"use client"

import { ReactNode, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./modal.css"

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
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
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

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
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 350,
              mass: 0.8,
            }}
          >
            <div
              ref={modalRef}
              className={`modal-dialog-custom modal-size-${size}`}
              onClick={(e) => e.stopPropagation()}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Modal
