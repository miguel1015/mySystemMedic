import React from "react";
import { CheckCircle } from "lucide-react";
import Modal from "../modal";

interface ModalConfirmProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  open,
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="text-center p-3">
        <div className="mb-3 d-flex justify-content-center">
          <CheckCircle size={55} className="text-success" />
        </div>

        {subtitle && <p className="text-muted mb-4">{subtitle}</p>}

        <div className="d-flex gap-3 justify-content-center mt-4">
          <button className="btn btn-outline-secondary px-4" onClick={onClose}>
            {cancelText}
          </button>

          <button className="btn btn-success px-4" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirm;
