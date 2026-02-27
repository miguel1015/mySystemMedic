import React from "react"
import { Modal, Button, Typography, Image, Space } from "antd"
import { Trash2, X, FileText } from "lucide-react"
import { FileMeta } from "./types"
import { isImageSrc } from "./utils"

const { Text } = Typography

interface PreviewModalProps {
  open: boolean;
  previewSrc: string | null;
  fileMeta: FileMeta | null;
  hasFile: boolean;
  initialPreview?: string;
  onClose: () => void;
  onRemove: () => void;
}

export function PreviewModal({
  open,
  previewSrc,
  fileMeta,
  hasFile,
  initialPreview,
  onClose,
  onRemove,
}: PreviewModalProps) {
  const isImage = previewSrc ? isImageSrc(previewSrc) : false

  return (
    <Modal
      open={open && !!previewSrc}
      onCancel={onClose}
      title={hasFile && fileMeta ? fileMeta.file.name : "Archivo actual"}
      footer={
        <Space>
          {hasFile && (
            <Button
              danger
              icon={<Trash2 size={14} />}
              onClick={() => {
                onRemove()
                onClose()
              }}
            >
              Quitar
            </Button>
          )}
          <Button type="primary" icon={<X size={14} />} onClick={onClose}>
            Cerrar
          </Button>
        </Space>
      }
      width={580}
      centered
      zIndex={2000}
      destroyOnHidden
    >
      {previewSrc && isImage ? (
        <Image
          src={previewSrc}
          alt="Preview"
          style={{ width: "100%", borderRadius: 6 }}
        />
      ) : previewSrc && !isImage ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <FileText size={48} style={{ color: "#8c8c8c", marginBottom: 12 }} />
          {hasFile && fileMeta && (
            <>
              <Text style={{ display: "block" }}>{fileMeta.file.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {(fileMeta.file.size / 1024).toFixed(1)} KB
              </Text>
            </>
          )}
          {!hasFile && initialPreview?.startsWith("data:application/pdf") && (
            <a
              href={initialPreview}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1677ff" }}
            >
              Abrir PDF
            </a>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
