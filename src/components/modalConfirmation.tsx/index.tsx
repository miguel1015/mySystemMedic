import React from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "antd";
import Modal from "../modal";

interface ModalConfirmProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  open,
  title,
  subtitle,
  onClose,
  onConfirm,
  loading = false,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) => {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
    >
      <div
        style={{
          padding: 16,
          textAlign: "center",
        }}
      >
        {/* ICONO */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <Loader2
              size={56}
              style={{
                color: "#52c41a",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <CheckCircle size={56} color="#52c41a" />
          )}
        </div>

        {/* SUBTÍTULO */}
        {subtitle && (
          <p
            style={{
              color: "#8c8c8c",
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* BOTONES */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Button danger onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            type="primary"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>

      {/* SPINNER KEYFRAMES */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
};

export default ModalConfirm;
