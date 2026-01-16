"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnOutsideClick = true,
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const sizes = {
    sm: "modal-sm",
    md: "",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="modal-backdrop fade show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
          >
            <div
              className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizes[size]}`}
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content shadow-lg">
                {/* Header fijo */}
                <div className="modal-header">
                  <h5 className="modal-title">{title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                  />
                </div>

                {/* Body con scroll */}
                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    maxHeight: "calc(90vh - 130px)",
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
